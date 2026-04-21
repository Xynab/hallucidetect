"""
Knowledge base: FAISS + Wikipedia fallback
Extended knowledge passages to catch common hallucinations
"""

import faiss
import numpy as np
from loguru import logger
from sentence_transformers import SentenceTransformer
from cachetools import LRUCache

from app.core.config import get_settings
from app.ml.wiki_retriever import search_wikipedia

# ─────────────────────────────────────────────
# Expanded Knowledge Passages
# ─────────────────────────────────────────────
KNOWLEDGE_PASSAGES = [
    # Einstein
    "Albert Einstein was born on March 14, 1879, in Ulm, in the Kingdom of Württemberg in the German Empire.",
    "Albert Einstein died on April 18, 1955, in Princeton, New Jersey, United States.",
    "Einstein developed the theory of special relativity in 1905 and general relativity in 1915.",
    "Einstein won the Nobel Prize in Physics in 1921 for his discovery of the law of the photoelectric effect.",
    "Einstein did not invent the telephone. The telephone was invented by Alexander Graham Bell.",

    # Telephone
    "The telephone was invented by Alexander Graham Bell, who was awarded the first US patent for the telephone on March 7, 1876.",
    "Alexander Graham Bell, not Einstein, invented the telephone in 1876.",

    # Python
    "Python programming language was created by Guido van Rossum and first released in 1991.",
    "Python is a high-level, general-purpose programming language emphasizing code readability.",

    # Machine Learning / AI
    "Machine learning is a subset of artificial intelligence that enables systems to learn from data without being explicitly programmed.",
    "Deep learning is a subfield of machine learning that uses neural networks with many layers.",

    # Famous founders
    "Apple Inc. was co-founded by Steve Jobs, Steve Wozniak, and Ronald Wayne on April 1, 1976.",
    "Microsoft was founded by Bill Gates and Paul Allen on April 4, 1975.",
    "Amazon was founded by Jeff Bezos on July 5, 1994.",
    "Google was founded by Larry Page and Sergey Brin in 1998.",
    "Facebook (Meta) was founded by Mark Zuckerberg and co-founders in 2004.",

    # General Science
    "The speed of light in a vacuum is approximately 299,792,458 metres per second.",
    "Water boils at 100 degrees Celsius (212 degrees Fahrenheit) at standard atmospheric pressure.",
    "DNA (deoxyribonucleic acid) was first described by James Watson and Francis Crick in 1953.",
    "The Earth orbits the Sun once every approximately 365.25 days.",

    # Historical
    "World War II began on September 1, 1939, when Germany invaded Poland.",
    "World War II ended in 1945 with Germany surrendering on May 8 and Japan on September 2.",
    "The first moon landing occurred on July 20, 1969, when Apollo 11 astronauts Neil Armstrong and Buzz Aldrin landed.",
    "The Berlin Wall fell on November 9, 1989.",
]

# ─────────────────────────────────────────────
# Globals
# ─────────────────────────────────────────────
_index = None
_embedder = None
_cache = LRUCache(maxsize=1024)


def _get_embedder():
    global _embedder
    if _embedder is None:
        settings = get_settings()
        logger.info(f"Loading embedder: {settings.EMBEDDER_MODEL}")
        _embedder = SentenceTransformer(settings.EMBEDDER_MODEL)
    return _embedder


def _get_index():
    global _index
    if _index is None:
        try:
            logger.info("Building FAISS index...")
            embedder = _get_embedder()
            embs = embedder.encode(KNOWLEDGE_PASSAGES, convert_to_numpy=True).astype(np.float32)
            faiss.normalize_L2(embs)
            dim = embs.shape[1]
            _index = faiss.IndexFlatIP(dim)
            _index.add(embs)
            logger.info(f"FAISS ready ({_index.ntotal} passages)")
        except Exception as e:
            logger.error(f"FAISS build failed: {e}")
            _index = None
    return _index


def retrieve_evidence(claim: str, top_k: int = 5) -> list[str]:
    if not claim:
        return []

    if claim in _cache:
        return _cache[claim]

    try:
        embedder = _get_embedder()
        index = _get_index()

        if index is None:
            logger.warning("FAISS index unavailable")
            return []

        q = embedder.encode([claim], convert_to_numpy=True).astype(np.float32)
        faiss.normalize_L2(q)
        scores, idxs = index.search(q, top_k)

        results = []
        for score, idx in zip(scores[0], idxs[0]):
            if idx >= 0 and score > 0.25:
                results.append(KNOWLEDGE_PASSAGES[idx])

        if results:
            _cache[claim] = results

        return results

    except Exception as e:
        logger.warning(f"Evidence retrieval failed: {e}")
        return []


def preload():
    _get_index()