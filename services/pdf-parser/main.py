"""
FastAPI service for PDF price list extraction using pdfplumber.
Deployed separately (Railway/Render) since Netlify doesn't support Python.
"""

import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from extractor import extract_tables_from_pdf
from normalizer import canonical_key

app = FastAPI(title="SWING PDF Parser", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/extract")
async def extract_prices(file: UploadFile = File(...)):
    """Extract prices from a PDF file.

    Returns a list of extracted items with canonical keys.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    contents = await file.read()
    if len(contents) < 100:
        raise HTTPException(status_code=400, detail="PDF file is too small")

    try:
        pdf_bytes = io.BytesIO(contents)
        items = extract_tables_from_pdf(pdf_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"PDF parsing failed: {str(e)}")

    # Add canonical keys to each item
    for item in items:
        item["canonical_key"] = canonical_key(
            item.get("product", ""),
            item.get("size"),
        )

    return {
        "items": items,
        "total": len(items),
    }
