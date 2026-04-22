from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List
import json


class Settings(BaseSettings):
    APP_NAME: str = "HalluciDetect API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    ANTHROPIC_API_KEY: str = ""
    NLI_MODEL: str = "cross-encoder/nli-MiniLM2-L6-H768"
    EMBEDDER_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    MAX_CLAIMS: int = 20
    TOP_K_RETRIEVAL: int = 5
    CONFIDENCE_THRESHOLD: float = 0.30

    DATABASE_URL: str = ""

    # Accept both JSON string and list
    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    def get_cors_origins(self) -> List[str]:
        try:
            parsed = json.loads(self.CORS_ORIGINS)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass
        # fallback: comma-separated string
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
    
