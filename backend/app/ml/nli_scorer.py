"""
Improved NLI scorer: stable thresholds, GPU support, realistic confidence
Fixed: reduced false contradiction rate for factually correct claims
"""

import torch
from loguru import logger
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from app.core.config import get_settings
from app.models.schemas import VeracityLabel

_tokenizer = None
_model = None
_device = None


def _load():
    global _tokenizer, _model, _device

    if _model is None:
        settings = get_settings()
        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Loading NLI model: {settings.NLI_MODEL} on {_device}")

        _tokenizer = AutoTokenizer.from_pretrained(settings.NLI_MODEL)
        _model = AutoModelForSequenceClassification.from_pretrained(settings.NLI_MODEL)
        _model.to(_device)
        _model.eval()
        logger.info("NLI model ready")

    return _tokenizer, _model, _device


def _label_map(model):
    id2label = getattr(model.config, "id2label", {})
    mapping = {}
    for idx, name in id2label.items():
        name_lower = name.lower()
        if "entail" in name_lower:
            mapping["entailment"] = int(idx)
        elif "contradict" in name_lower:
            mapping["contradiction"] = int(idx)
        elif "neutral" in name_lower:
            mapping["neutral"] = int(idx)

    if not mapping:
        mapping = {"contradiction": 0, "neutral": 1, "entailment": 2}

    return mapping


def score_claim(claim: str, evidence_passages: list[str]):
    """
    Score a claim against evidence passages.
    Returns: (label, confidence, best_evidence)

    Key fix: we run NLI in BOTH directions:
    - premise=evidence, hypothesis=claim  (standard)
    - premise=claim, hypothesis=evidence  (reverse check)
    And take the max entailment across both directions to reduce false contradictions.
    """

    if not evidence_passages:
        return VeracityLabel.INSUFFICIENT_EVIDENCE, 0.0, ""

    tokenizer, model, device = _load()
    settings = get_settings()
    lmap = _label_map(model)

    best_entail = 0.0
    best_contra = 0.0
    best_neutral = 0.0
    best_evidence = ""

    for passage in evidence_passages[: settings.TOP_K_RETRIEVAL]:
        try:
            # Direction 1: evidence entails claim
            entail_1, contra_1, neutral_1 = _run_nli(
                tokenizer, model, device, lmap,
                premise=passage, hypothesis=claim
            )

            # Direction 2: claim entails evidence (catches paraphrases)
            entail_2, contra_2, neutral_2 = _run_nli(
                tokenizer, model, device, lmap,
                premise=claim, hypothesis=passage
            )

            # Take best entailment from either direction
            entail = max(entail_1, entail_2)
            # Contradiction only counts if BOTH directions agree
            contra = min(contra_1, contra_2)
            neutral = max(neutral_1, neutral_2)

            if entail > best_entail:
                best_entail = entail
                best_evidence = passage

            best_contra = max(best_contra, contra)
            best_neutral = max(best_neutral, neutral)

        except Exception as e:
            logger.warning(f"NLI error: {e}")

    # ── Decision logic ──────────────────────────────────────────────
    # Strong support (lowered threshold slightly for better recall)
    if best_entail >= 0.70 and best_entail > best_contra * 1.2:
        return VeracityLabel.SUPPORTED, round(min(best_entail, 0.95), 2), best_evidence

    # Strong contradiction — require high confidence AND clear margin over entailment
    if best_contra >= 0.75 and best_contra > best_entail * 1.5:
        return VeracityLabel.UNSUPPORTED, round(min(best_contra, 0.95), 2), best_evidence

    # Medium support
    if best_entail >= 0.55 and best_entail > best_contra:
        return VeracityLabel.SUPPORTED, round(best_entail, 2), best_evidence

    # Medium contradiction (strict: must significantly exceed entailment)
    if best_contra >= 0.65 and best_contra > best_entail * 1.3:
        return VeracityLabel.UNSUPPORTED, round(best_contra, 2), best_evidence

    # Ambiguous → insufficient evidence
    confidence = max(best_entail, best_contra, best_neutral)
    return VeracityLabel.INSUFFICIENT_EVIDENCE, round(confidence, 2), best_evidence


def _run_nli(tokenizer, model, device, lmap, premise: str, hypothesis: str):
    """Run a single NLI inference and return (entail, contra, neutral) probs."""
    inputs = tokenizer(
        premise, hypothesis,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=512,
    ).to(device)

    with torch.no_grad():
        logits = model(**inputs).logits

    probs = torch.softmax(logits, dim=-1)[0].cpu().numpy()
    entail  = float(probs[lmap["entailment"]])
    contra  = float(probs[lmap["contradiction"]])
    neutral = float(probs[lmap["neutral"]])
    return entail, contra, neutral


def preload():
    _load()