from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.db.database import Base


class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    model_name = Column(String(100), nullable=True)
    total_claims = Column(Integer, default=0)
    supported = Column(Integer, default=0)
    unsupported = Column(Integer, default=0)
    insufficient = Column(Integer, default=0)
    faithfulness = Column(Float, default=0.0)
    hallucination_rate = Column(Float, default=0.0)
    claims_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)