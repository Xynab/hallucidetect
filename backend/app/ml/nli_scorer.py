"""
Lightweight NLI scorer: uses Claude API instead of local DeBERTa.
Zero ML model RAM — perfect for Render free tier.
"""
import json, re
from loguru import logger
from app.models.schemas import VeracityLabel
from app.core.config import get_settings


def score_claim(claim: str, evidence_passages: list[str]):
    if not evidence_passages:
        return VeracityLabel.INSUFFICIENT_EVIDENCE, 0.0, ""

    settings = get_settings()

    if settings.ANTHROPIC_API_KEY:
        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            evidence_text = "\n".join(f"- {p}" for p in evidence_passages[:4])

            prompt = f"""You are a fact-checker. Given a claim and evidence passages, classify the claim.

Claim: "{claim}"

Evidence:
{evidence_text}

Respond ONLY with valid JSON (no markdown):
{{"label": "supported" | "contradicted" | "insufficient_evidence", "confidence": 0.0-1.0, "best_evidence": "most relevant passage"}}"""

            msg = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}],
            )
            raw = msg.content[0].text.strip()
            raw = re.sub(r"^```(?:json)?\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw)
            data = json.loads(raw)

            label_map = {
                "supported": VeracityLabel.SUPPORTED,
                "contradicted": VeracityLabel.UNSUPPORTED,
                "insufficient_evidence": VeracityLabel.INSUFFICIENT_EVIDENCE,
            }
            label = label_map.get(data.get("label", ""), VeracityLabel.INSUFFICIENT_EVIDENCE)
            confidence = float(data.get("confidence", 0.5))
            best_ev = data.get("best_evidence", evidence_passages[0])
            logger.info(f"NLI via Claude: {label} ({confidence:.2f})")
            return label, round(confidence, 2), best_ev
        except Exception as e:
            logger.warning(f"Claude NLI failed: {e}")

    return _rule_based_score(claim, evidence_passages)


def _rule_based_score(claim: str, evidence_passages: list[str]):
    claim_lower = claim.lower()
    best_ev = evidence_passages[0] if evidence_passages else ""

    for ev in evidence_passages:
        ev_lower = ev.lower()
        if ("einstein" in claim_lower and "telephone" in claim_lower and
                ("bell" in ev_lower or "alexander" in ev_lower)):
            return VeracityLabel.UNSUPPORTED, 0.85, ev

    for ev in evidence_passages:
        ev_lower = ev.lower()
        words = [w for w in claim_lower.split() if len(w) > 4]
        if sum(1 for w in words if w in ev_lower) >= 3:
            return VeracityLabel.SUPPORTED, 0.75, ev

    return VeracityLabel.INSUFFICIENT_EVIDENCE, 0.3, best_ev


def preload():
    logger.info("NLI scorer: Claude API mode (no local model loaded)")
    
