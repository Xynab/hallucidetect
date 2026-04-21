from fastapi import APIRouter, HTTPException
from loguru import logger

from app.models.schemas import AnalysisRequest, AnalysisResult
from app.services.analysis_service import analyze

router = APIRouter()


@router.post(
    "/analyze",
    response_model=AnalysisResult,
    summary="Detect hallucinations"
)
async def analyze_endpoint(request: AnalysisRequest):
    """
    Analyze an LLM response for hallucinations.
    """

    try:
        # 🔍 Input validation
        if not request.response or len(request.response.strip()) < 5:
            raise ValueError("Response text is too short")

        if not request.query or len(request.query.strip()) < 1:
            raise ValueError("Query cannot be empty")

        # 🧠 Model safety
        if not request.model_name and not request.model_names:
            logger.warning("No model specified. Defaulting to 'unknown'")
            request.model_name = "unknown"

        logger.info(
            f"Incoming request | model_name={request.model_name} | model_names={request.model_names}"
        )

        # 🚀 Run analysis
        result = analyze(request)

        if not result:
            raise ValueError("Analysis returned no output")

        return result

    except Exception as exc:
        logger.exception("🔥 ANALYSIS FAILED")

        # Full error for debugging
        print("\n========== ERROR START ==========")
        print(type(exc).__name__, ":", exc)
        print("========== ERROR END ==========\n")

        raise HTTPException(
            status_code=500,
            detail=f"Analysis error: {str(exc)}"
        )