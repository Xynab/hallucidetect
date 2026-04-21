from pydantic import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # ── App Info ─────────────────────────────────────────
    APP_NAME: str = "HalluciDetect API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── API Keys ─────────────────────────────────────────
    ANTHROPIC_API_KEY: str = ""

    # ── Models ───────────────────────────────────────────
    NLI_MODEL: str = "cross-encoder/nli-deberta-v3-base"
    EMBEDDER_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    # ── Pipeline Config ──────────────────────────────────
    MAX_CLAIMS: int = 20
    TOP_K_RETRIEVAL: int = 5
    CONFIDENCE_THRESHOLD: float = 0.30

    # ── Database (NEW ✅) ────────────────────────────────
    DATABASE_URL: str = ""

    # ── CORS ────────────────────────────────────────────
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
