from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "HalluciDetect API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    ANTHROPIC_API_KEY: str = ""

    # Lighter models for free tier (fit in 512MB)
    NLI_MODEL: str = "cross-encoder/nli-MiniLM2-L6-H768"
    EMBEDDER_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    MAX_CLAIMS: int = 20
    TOP_K_RETRIEVAL: int = 5
    CONFIDENCE_THRESHOLD: float = 0.30

    DATABASE_URL: str = ""

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
    
