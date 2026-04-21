from fastapi import APIRouter, HTTPException
from app.db.database import SessionLocal
from app.db.models import AnalysisRecord

router = APIRouter()


@router.get("/history")
def get_history():
    db = SessionLocal()
    try:
        records = db.query(AnalysisRecord).order_by(AnalysisRecord.id.desc()).all()
        return [
            {
                "id": r.id,
                "query": r.query,
                "model_name": r.model_name or "unknown",
                "faithfulness": r.faithfulness or 0.0,
                "hallucination_rate": r.hallucination_rate or 0.0,
                "created_at": r.created_at.isoformat() if hasattr(r, "created_at") and r.created_at else None,
            }
            for r in records
        ]
    finally:
        db.close()


@router.get("/history/{record_id}")
def get_history_detail(record_id: int):
    db = SessionLocal()
    try:
        r = db.query(AnalysisRecord).filter(AnalysisRecord.id == record_id).first()
        if not r:
            raise HTTPException(status_code=404, detail="Record not found")
        return {
            "id": r.id,
            "query": r.query,
            "response": r.response,
            "model_name": r.model_name or "unknown",
            "faithfulness": r.faithfulness or 0.0,
            "hallucination_rate": r.hallucination_rate or 0.0,
            "total_claims": r.total_claims,
            "supported": r.supported,
            "unsupported": r.unsupported,
            "claims": r.claims_json or [],
            "created_at": r.created_at.isoformat() if hasattr(r, "created_at") and r.created_at else None,
        }
    finally:
        db.close()