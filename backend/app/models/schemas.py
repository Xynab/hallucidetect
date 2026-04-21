from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional, List


# 🔥 GLOBAL BASE MODEL (fix once for all models)
class CustomBaseModel(BaseModel):
    model_config = {
        "protected_namespaces": ()
    }


# ─────────────────────────────────────────────
# Label for claim verification
# ─────────────────────────────────────────────
class VeracityLabel(str, Enum):
    SUPPORTED = "supported"
    UNSUPPORTED = "unsupported"
    INSUFFICIENT_EVIDENCE = "insufficient_evidence"


# ─────────────────────────────────────────────
# Individual claim result
# ─────────────────────────────────────────────
class Claim(CustomBaseModel):
    id: int
    text: str
    label: VeracityLabel
    confidence: float = Field(ge=0.0, le=1.0)

    # 🔥 FIX: avoid mutable default
    evidence: List[str] = Field(default_factory=list)

    evidence_source: Optional[str] = None
    explanation: str = ""

    span_start: Optional[int] = None
    span_end: Optional[int] = None


# ─────────────────────────────────────────────
# API Request model
# ─────────────────────────────────────────────
class AnalysisRequest(CustomBaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    response: str = Field(..., min_length=10, max_length=10000)

    model_name: Optional[str] = "unknown"
    model_names: Optional[List[str]] = None


# ─────────────────────────────────────────────
# Aggregated statistics
# ─────────────────────────────────────────────
class AnalysisStats(CustomBaseModel):
    total_claims: int
    supported: int
    unsupported: int
    insufficient_evidence: int
    overall_faithfulness_score: float
    hallucination_rate: float


# ─────────────────────────────────────────────
# Single Model Result
# ─────────────────────────────────────────────
class ModelResult(CustomBaseModel):
    model_name: str
    claims: List[Claim]
    stats: AnalysisStats


# ─────────────────────────────────────────────
# Final API Response
# ─────────────────────────────────────────────
class AnalysisResult(CustomBaseModel):
    query: str
    response: str

    model_name: Optional[str] = None
    results: Optional[List[ModelResult]] = None

    claims: List[Claim]
    stats: AnalysisStats
    annotated_response: str
    processing_time_ms: float


# ─────────────────────────────────────────────
# Health Check Response
# ─────────────────────────────────────────────
class HealthResponse(CustomBaseModel):
    status: str
    version: str
    models_loaded: bool