from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import get_settings

from app.api.routes import analyze, health, examples
from app.api.routes.history import router as history_router
from app.api.routes.report import router as report_router
from app.api.routes.upload import router as upload_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("⚡ HalluciDetect API starting up …")

    try:
        from app.ml.knowledge_base import preload as kb_load
        from app.ml.nli_scorer import preload as nli_load

        kb_load()
        nli_load()

        logger.info("✅ All models loaded")

    except Exception as exc:
        logger.error(f"Model loading failed: {exc}")

    yield
    logger.info("HalluciDetect API shut down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "LLM Hallucination Detection API — "
        "claim extraction · FAISS retrieval · DeBERTa NLI scoring · span attribution"
    ),
    lifespan=lifespan,
)

# ─────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# API Routes
# ─────────────────────────────────────────────
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(analyze.router, prefix="/api/v1", tags=["analysis"])
app.include_router(examples.router, prefix="/api/v1", tags=["examples"])
app.include_router(history_router, prefix="/api/v1", tags=["history"])
app.include_router(report_router, prefix="/api/v1", tags=["report"])  # 🔥 FIXED
app.include_router(upload_router, prefix="/api/v1", tags=["upload"])  # 🔥 FIXED


@app.get("/", include_in_schema=False)
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/v1/health",
    }