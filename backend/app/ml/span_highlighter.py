"""
Span highlighter: maps each claim back to character offsets in the
original response, then builds an HTML-annotated string for the UI.
"""
from __future__ import annotations
import re
from app.models.schemas import VeracityLabel


def find_claim_span(response: str, claim: str) -> tuple[int | None, int | None]:
    """Return (start, end) character offsets of the claim in the response."""
    # 1. Exact match
    idx = response.find(claim)
    if idx != -1:
        return idx, idx + len(claim)

    # 2. Case-insensitive
    idx = response.lower().find(claim.lower())
    if idx != -1:
        return idx, idx + len(claim)

    # 3. Longest common window (sliding phrase search)
    words = claim.split()
    for size in range(min(len(words), 9), 2, -1):
        for i in range(len(words) - size + 1):
            phrase = " ".join(words[i : i + size])
            m = re.search(re.escape(phrase), response, re.IGNORECASE)
            if m:
                return m.start(), m.end()

    return None, None


_CSS: dict[VeracityLabel, str] = {
    VeracityLabel.SUPPORTED: "highlight-supported",
    VeracityLabel.UNSUPPORTED: "highlight-unsupported",
    VeracityLabel.INSUFFICIENT_EVIDENCE: "highlight-insufficient",
}


def annotate_response(response: str, claims: list) -> str:  # type: ignore[type-arg]
    """
    Build an HTML-annotated version of the response.
    Supported spans → green highlight, unsupported → red, insufficient → amber.
    """
    spans: list[tuple[int, int, VeracityLabel]] = []
    for c in claims:
        if c.span_start is not None and c.span_end is not None:
            spans.append((c.span_start, c.span_end, c.label))

    if not spans:
        return response

    spans.sort(key=lambda x: x[0])

    parts: list[str] = []
    cursor = 0
    for start, end, label in spans:
        if start < cursor:
            continue
        parts.append(_escape(response[cursor:start]))
        css = _CSS.get(label, "highlight-insufficient")
        parts.append(f'<mark class="{css}">{_escape(response[start:end])}</mark>')
        cursor = end
    parts.append(_escape(response[cursor:]))
    return "".join(parts)


def _escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
    )