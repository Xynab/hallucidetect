from fastapi import APIRouter, UploadFile, File
import pdfplumber

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    text = ""

    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    return {
        "filename": file.filename,
        "text": text[:5000]  # limit size
    }