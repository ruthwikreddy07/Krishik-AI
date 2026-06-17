"""
Disease Detection API — Upload crop leaf images for CNN-based disease diagnosis.
Supports expert verification workflow.
"""
import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.database import get_db
from ..models.schemas import DiseaseRecord, Farmer
from ..ml.disease_detection import detect_disease

router = APIRouter(prefix="/api/disease", tags=["Disease Detection"])


# ── Pydantic models ─────────────────────────────────────────

class DiseaseResponse(BaseModel):
    id: int
    farmer_id: int
    crop_id: int | None
    image_url: str
    detected_disease: str
    confidence: float
    treatment_recommendation: str
    verified_by_expert: bool
    expert_comments: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class DetectionResult(BaseModel):
    disease_name: str
    confidence: float
    treatment: str
    image_path: str


# ── Endpoints ───────────────────────────────────────────────

@router.post("/detect", response_model=DetectionResult)
async def detect_crop_disease(
    farmer_id: int = Form(...),
    crop_id: int | None = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a crop leaf image and get CNN-based disease detection results.
    The image is saved and the prediction is stored in the database.
    """
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Save uploaded image
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_ext = os.path.splitext(image.filename)[1] if image.filename else ".jpg"
    filename = f"{uuid.uuid4().hex}{file_ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    contents = await image.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    # Run ML inference
    result = detect_disease(filepath)

    # Save record to database
    record = DiseaseRecord(
        farmer_id=farmer_id,
        crop_id=crop_id,
        image_url=filepath,
        detected_disease=result["disease_name"],
        confidence=result["confidence"],
        treatment_recommendation=result["treatment"],
    )
    db.add(record)
    db.commit()

    return DetectionResult(
        disease_name=result["disease_name"],
        confidence=result["confidence"],
        treatment=result["treatment"],
        image_path=filepath,
    )


@router.get("/history/{farmer_id}", response_model=list[DiseaseResponse])
def get_disease_history(farmer_id: int, db: Session = Depends(get_db)):
    """Get all past disease detection records for a farmer."""
    records = (
        db.query(DiseaseRecord)
        .filter(DiseaseRecord.farmer_id == farmer_id)
        .order_by(DiseaseRecord.created_at.desc())
        .all()
    )
    return records
