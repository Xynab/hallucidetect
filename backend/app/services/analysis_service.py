"""
Analysis service: Claim extraction → Retrieval → NLI → Stats → DB
Key fixes:
- Contradiction detection now properly flags false claims (telephone inventor etc.)
- Evidence expanded with Wikipedia before NLI scoring
- DB dedup uses query+response hash, saves model_name properly
"""

import time
from loguru import logger

from app.db.database import SessionLocal
from app.db.models import AnalysisRecord

from app.models.schemas import (
    AnalysisRequest,
    AnalysisResult,
    AnalysisStats,
    Claim,
    VeracityLabel,
    ModelResult,
)

from app.ml.claim_extractor import extract_claims
from app.ml.knowledge_base import retrieve_evidence
from app.ml.wiki_retriever import search_wikipedia
from app.ml.nli_scorer import score_claim, preload
from app.ml.span_highlighter import find_claim_span, annotate_response

# Preload NLI once at startup
preload()


def analyze(request: AnalysisRequest) -> AnalysisResult:
    t0 = time.time()

    models = request.model_names or [request.model_name or "unknown"]
    logger.info(f"Analysis start | models={models} | response_len={len(request.response)}")

    all_results: list[ModelResult] = []

    for model in models:
        raw_claims = extract_claims(request.query, request.response)
        if not raw_claims:
            logger.warning("No claims extracted")
            raw_claims = []

        claims: list[Claim] = []

        for idx, text in enumerate(raw_claims):
            # Step 1: FAISS retrieval
            evidence = retrieve_evidence(text)
            evidence_source = "Knowledge base"

            # Step 2: Always also search Wikipedia for richer evidence
            # This is critical for catching contradictions like "telephone inventor"
            wiki = search_wikipedia(text)
            if wiki:
                evidence = list(evidence or []) + wiki[:3]
                if not retrieve_evidence(text):
                    evidence_source = "Wikipedia"
                else:
                    evidence_source = "Knowledge base + Wikipedia"

            # Deduplicate evidence
            seen = set()
            unique_evidence = []
            for e in evidence:
                if e not in seen:
                    seen.add(e)
                    unique_evidence.append(e)
            evidence = unique_evidence[:6]

            if not evidence:
                label = VeracityLabel.INSUFFICIENT_EVIDENCE
                confidence = 0.0
                best_ev = ""
            else:
                label, confidence, best_ev = score_claim(text, evidence)

            span_start, span_end = find_claim_span(request.response, text)

            claims.append(
                Claim(
                    id=idx + 1,
                    text=text,
                    label=label,
                    confidence=confidence,
                    evidence=[best_ev] if best_ev else evidence[:2],
                    evidence_source=evidence_source,
                    explanation=_explanation(label, confidence),
                    span_start=span_start,
                    span_end=span_end,
                )
            )

        total = len(claims)
        supported = sum(c.label == VeracityLabel.SUPPORTED for c in claims)
        unsupported = sum(c.label == VeracityLabel.UNSUPPORTED for c in claims)
        insufficient = sum(c.label == VeracityLabel.INSUFFICIENT_EVIDENCE for c in claims)

        faithfulness = round(supported / total, 4) if total else 0.0
        hallucination_rate = round(unsupported / total, 4) if total else 0.0

        stats = AnalysisStats(
            total_claims=total,
            supported=supported,
            unsupported=unsupported,
            insufficient_evidence=insufficient,
            overall_faithfulness_score=faithfulness,
            hallucination_rate=hallucination_rate,
        )

        all_results.append(ModelResult(model_name=model, claims=claims, stats=stats))

    if not all_results:
        raise ValueError("No analysis results generated")

    annotated = annotate_response(request.response, all_results[0].claims)
    elapsed = round((time.time() - t0) * 1000, 1)
    logger.info(f"Analysis completed in {elapsed}ms")

    # Save to DB
    db = None
    try:
        db = SessionLocal()
        first = all_results[0]

        existing = db.query(AnalysisRecord).filter(
            AnalysisRecord.query == request.query,
            AnalysisRecord.response == request.response,
        ).first()

        if not existing:
            db.add(AnalysisRecord(
                query=request.query,
                response=request.response,
                model_name=first.model_name,
                total_claims=first.stats.total_claims,
                supported=first.stats.supported,
                unsupported=first.stats.unsupported,
                insufficient=first.stats.insufficient_evidence,
                faithfulness=first.stats.overall_faithfulness_score,
                hallucination_rate=first.stats.hallucination_rate,
                claims_json=[
                    {
                        "id": c.id,
                        "text": c.text,
                        "label": c.label.value,
                        "confidence": c.confidence,
                        "evidence": c.evidence,
                        "explanation": c.explanation,
                        "evidence_source": c.evidence_source,
                    }
                    for c in first.claims
                ],
            ))
            db.commit()
    except Exception as e:
        logger.warning(f"DB save failed: {e}")
    finally:
        if db:
            db.close()

    return AnalysisResult(
        query=request.query,
        response=request.response,
        model_name=all_results[0].model_name,
        results=all_results,
        claims=all_results[0].claims,
        stats=all_results[0].stats,
        annotated_response=annotated,
        processing_time_ms=elapsed,
    )


def _explanation(label: VeracityLabel, confidence: float) -> str:
    pct = round(confidence * 100)
    if label == VeracityLabel.SUPPORTED:
        return f"Grounding evidence supports this claim with {pct}% confidence."
    if label == VeracityLabel.UNSUPPORTED:
        return f"Evidence contradicts this claim ({pct}% confidence). Likely a hallucination."
    return f"No reliable grounding evidence found (confidence {pct}%)."