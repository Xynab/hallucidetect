"""
Lightweight knowledge base: sklearn cosine similarity instead of FAISS
Fits within 512MB RAM on Render free tier
"""

import numpy as np
from loguru import logger
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from cachetools import LRUCache

from app.core.config import get_settings
from app.ml.wiki_retriever import search_wikipedia

KNOWLEDGE_PASSAGES = [
    "Albert Einstein was born on March 14, 1879, in Ulm, in the Kingdom of Württemberg in the German Empire.",
    "Albert Einstein died on April 18, 1955, in Princeton, New Jersey, United States.",
    "Einstein developed the theory of special relativity in 1905 and general relativity in 1915.",
    "Einstein won the Nobel Prize in Physics in 1921 for his discovery of the law of the photoelectric effect.",
    "Einstein did not invent the telephone. The telephone was invented by Alexander Graham Bell.",
    "The telephone was invented by Alexander Graham Bell, who was awarded the first US patent for the telephone on March 7, 1876.",
    "Alexander Graham Bell, not Einstein, invented the telephone in 1876.",
    "Python programming language was created by Guido van Rossum and first released in 1991.",
    "Python is a high-level, general-purpose programming language emphasizing code readability.",
    "Machine learning is a subset of artificial intelligence that enables systems to learn from data without being explicitly programmed.",
    "Apple Inc. was co-founded by Steve Jobs, Steve Wozniak, and Ronald Wayne on April 1, 1976.",
    "Microsoft was founded by Bill Gates and Paul Allen on April 4, 1975.",
    "Amazon was founded by Jeff Bezos on July 5, 1994.",
    "Google was founded by Larry Page and Sergey Brin in 1998.",
    "The speed of light in a vacuum is approximately 299,792,458 metres per second.",
    "The Earth orbits the Sun once every approximately 365.25 days.",
    "World War II began on September 1, 1939, when Germany invaded Poland.",
    "The first moon landing occurred on July 20, 1969, when Apollo 11 astronauts Neil Armstrong and Buzz Aldrin landed.",
]

_embedder = None
_passage_embeddings = None
_cache = LRUCache(maxsize=512)


def _get_embedder():
    global _embedder
    if _embedder is None:
        settings = get_settings()
        logger.info(f"Loading embedder: {settings.EMBEDDER_MODEL}")
        _embedder = SentenceTransformer(settings.EMBEDDER_MODEL)
    return _embedder


def _get_passage_embeddings():
    global _passage_embeddings
    if _passage_embeddings is None:
        logger.info("Computing passage embeddings...")
        embedder = _get_embedder()
        _passage_embeddings = embedder.encode(
            KNOWLEDGE_PASSAGES, convert_to_numpy=True, show_progress_bar=False
        )
        logger.info(f"Embeddings ready for {len(KNOWLEDGE_PASSAGES)} passages")
    return _passage_embeddings


def retrieve_evidence(claim: str, top_k: int = 5) -> list[str]:
    if not claim:
        return []
    if claim in _cache:
        return _cache[claim]
    try:
        embedder = _get_embedder()
        passage_embs = _get_passage_embeddings()
        q = embedder.encode([claim], convert_to_numpy=True)
        scores = cosine_similarity(q, passage_embs)[0]
        top_indices = np.argsort(scores)[::-1][:top_k]
        results = [KNOWLEDGE_PASSAGES[i] for i in top_indices if scores[i] > 0.25]
        if results:
            _cache[claim] = results
        return results
    except Exception as e:
        logger.warning(f"Evidence retrieval failed: {e}")
        return []


def preload():
    _get_passage_embeddings()
