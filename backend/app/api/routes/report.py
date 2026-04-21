from fastapi import APIRouter
from fastapi.responses import FileResponse
from app.services.report_service import generate_pdf_report
from app.models.schemas import AnalysisResult

router = APIRouter()

@router.post("/export-pdf")
def export_pdf(result: AnalysisResult):
    filepath = generate_pdf_report(result)
    return FileResponse(filepath, filename="report.pdf")