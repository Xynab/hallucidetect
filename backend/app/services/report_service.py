from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import os
import uuid

def generate_pdf_report(result):
    filename = f"report_{uuid.uuid4().hex}.pdf"
    filepath = os.path.join("reports", filename)

    os.makedirs("reports", exist_ok=True)

    doc = SimpleDocTemplate(filepath)
    styles = getSampleStyleSheet()

    elements = []

    elements.append(Paragraph("Hallucination Detection Report", styles["Title"]))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph(f"Query: {result.query}", styles["Normal"]))
    elements.append(Paragraph(f"Model: {result.model_name}", styles["Normal"]))
    elements.append(Spacer(1, 10))

    stats = result.stats
    elements.append(Paragraph(f"Total Claims: {stats.total_claims}", styles["Normal"]))
    elements.append(Paragraph(f"Supported: {stats.supported}", styles["Normal"]))
    elements.append(Paragraph(f"Hallucinated: {stats.unsupported}", styles["Normal"]))
    elements.append(Paragraph(f"Unverifiable: {stats.insufficient_evidence}", styles["Normal"]))
    elements.append(Paragraph(f"Faithfulness Score: {stats.overall_faithfulness_score}", styles["Normal"]))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph("Claims:", styles["Heading2"]))

    for c in result.claims:
        elements.append(Paragraph(f"{c.text}", styles["Normal"]))
        elements.append(Paragraph(f"Label: {c.label}", styles["Normal"]))
        elements.append(Paragraph(f"Confidence: {round(c.confidence*100)}%", styles["Normal"]))
        elements.append(Spacer(1, 8))

    doc.build(elements)

    return filepath