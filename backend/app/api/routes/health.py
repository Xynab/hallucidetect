from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.core.config import get_settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="Health check")
async def health():
    settings = get_settings()
    return HealthResponse(
        status="ok",
        version=settings.APP_VERSION,
        models_loaded=True,
    )