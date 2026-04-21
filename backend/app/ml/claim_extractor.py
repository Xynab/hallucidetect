"""
Claim extractor: uses the Anthropic Claude API to decompose LLM
responses into atomic, individually verifiable factual claims.
Falls back to a rule-based splitter when no API key is set.
"""
import re
import json
from loguru import logger
from app.core.config import get_settings


EXTRACTION_PROMPT = """You are a precise fact-checking assistant. Your task is to decompose an LLM response into atomic, independently verifiable factual claims.

Rules:
1. Each claim must be a single, self-contained factual statement.
2. Exclude opinions, subjective statements, and pure reasoning / logic steps.
3. Only include claims that can be verified against real-world factual knowledge.
4. Preserve the original wording as closely as possible.
5. Each claim should be 1–2 sentences maximum.
6. Return ONLY a valid JSON array of strings — no markdown, no preamble.

User query: {query}

LLM Response to analyze:
{response}

Return ONLY the JSON array, e.g. ["claim 1", "claim 2"]:"""


def extract_claims(query: str, response: str) -> list[str]:
    """Extract atomic factual claims from an LLM response."""
    settings = get_settings()

    if not settings.ANTHROPIC_API_KEY:
        logger.warning("No Anthropic API key — using rule-based extractor")
        return _rule_based_extractor(response)

    try:
        from anthropic import Anthropic
        client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[{
                "role": "user",
                "content": EXTRACTION_PROMPT.format(query=query, response=response),
            }],
        )
        raw = message.content[0].text.strip()
        raw = re.sub(r"^```(?:json)?\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw)
        claims = json.loads(raw)
        if isinstance(claims, list):
            clean = [str(c).strip() for c in claims if str(c).strip()]
            logger.info(f"Claude extracted {len(clean)} claims")
            return clean[: settings.MAX_CLAIMS]
    except Exception as exc:
        logger.error(f"Claude extraction failed ({exc}) — falling back to rule-based")

    return _rule_based_extractor(response)


def _rule_based_extractor(text: str) -> list[str]:
    """Fallback: sentence-boundary split, keep declarative sentences."""
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    claims: list[str] = []
    skip_prefixes = (
        "I ", "We ", "You ", "In my ", "Note ", "Please ", "However,",
        "Therefore,", "Thus,", "So,", "But ",
    )
    for s in sentences:
        s = s.strip()
        if len(s) < 20 or s.endswith("?"):
            continue
        if any(s.startswith(p) for p in skip_prefixes):
            continue
        claims.append(s)
    logger.info(f"Rule-based extractor produced {len(claims)} claims")
    return claims[:20]