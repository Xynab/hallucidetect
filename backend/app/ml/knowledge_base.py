"""
Lightweight knowledge base: keyword retrieval, no ML model.
"""
import numpy as np
from loguru import logger
from cachetools import LRUCache
from app.ml.wiki_retriever import search_wikipedia

KNOWLEDGE_PASSAGES = [
    "Albert Einstein was born on March 14, 1879, in Ulm, Germany.",
    "Albert Einstein died on April 18, 1955, in Princeton, New Jersey.",
    "Einstein developed the theory of general relativity in 1915.",
    "Einstein won the Nobel Prize in Physics in 1921 for the photoelectric effect.",
    "Einstein did not invent the telephone. The telephone was invented by Alexander Graham Bell.",
    "The telephone was invented by Alexander Graham Bell, awarded the first US patent on March 7, 1876.",
    "Alexander Graham Bell invented the telephone in 1876, not Einstein.",
    "Python was created by Guido van Rossum and first released in 1991.",
    "Machine learning enables systems to learn from data without explicit programming.",
    "Apple was co-founded by Steve Jobs, Steve Wozniak, and Ronald Wayne on April 1, 1976.",
    "Microsoft was founded by Bill Gates and Paul Allen on April 4, 1975.",
    "Amazon was founded by Jeff Bezos on July 5, 1994.",
    "Google was founded by Larry Page and Sergey Brin in 1998.",
    "The Earth orbits the Sun once every approximately 365.25 days.",
    "World War II began on September 1, 1939, when Germany invaded Poland.",
    "The first moon landing occurred on July 20, 1969, with Apollo 11.",
]

_cache = LRUCache(maxsize=256)
STOPWORDS = {"the","a","an","is","was","were","in","on","at","and","or","he","she","it","also","to","of","by","for"}


def retrieve_evidence(claim: str, top_k: int = 4) -> list[str]:
    if not claim:
        return []
    if claim in _cache:
        return _cache[claim]

    claim_words = set(claim.lower().split()) - STOPWORDS
    scored = []
    for passage in KNOWLEDGE_PASSAGES:
        overlap = len(claim_words & set(passage.lower().split()))
        if overlap > 0:
            scored.append((overlap, passage))

    scored.sort(reverse=True)
    results = [p for _, p in scored[:top_k]]
    if results:
        _cache[claim] = results
    return results


def preload():
    logger.info("Knowledge base ready (keyword retrieval)")
    
