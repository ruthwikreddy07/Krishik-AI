"""
Disease Detection API — Upload crop leaf images for CNN-based disease diagnosis.
Supports expert verification workflow.
"""
import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.database import get_db
from ..models.schemas import DiseaseRecord, Farmer, Staff
from ..ml.disease_detection import detect_disease
from .auth import get_current_farmer, verify_expert_or_admin

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
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db),
):
    """
    Upload a crop leaf image and get CNN-based disease detection results (Authenticated).
    The image is saved and the prediction is stored in the database.
    """
    if current_farmer.id != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: you can only upload images for your own profile"
        )

    # Validate file type (only allow image formats)
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{image.content_type}'. Only JPEG, PNG, and WebP images are accepted.",
        )

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

    # Build a web-accessible URL path for the stored image
    image_url_path = f"/uploads/disease_images/{filename}"

    # Save record to database
    record = DiseaseRecord(
        farmer_id=farmer_id,
        crop_id=crop_id,
        image_url=image_url_path,
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
        image_path=image_url_path,
    )


@router.get("/history/{farmer_id}", response_model=list[DiseaseResponse])
def get_disease_history(
    farmer_id: int,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get all past disease detection records for the authenticated farmer."""
    if current_farmer.id != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: you can only view your own history"
        )

    records = (
        db.query(DiseaseRecord)
        .filter(DiseaseRecord.farmer_id == farmer_id)
        .order_by(DiseaseRecord.created_at.desc())
        .all()
    )
    return records


class VerifyDiseaseRequest(BaseModel):
    expert_comments: str


@router.get("/all", response_model=list[DiseaseResponse])
def get_all_disease_records(
    current_staff: Staff = Depends(verify_expert_or_admin),
    db: Session = Depends(get_db)
):
    """Retrieve all submitted disease records (Admin & Expert only)."""
    return db.query(DiseaseRecord).order_by(DiseaseRecord.created_at.desc()).all()


@router.put("/verify/{record_id}", response_model=DiseaseResponse)
def verify_disease_record(
    record_id: int,
    req: VerifyDiseaseRequest,
    current_staff: Staff = Depends(verify_expert_or_admin),
    db: Session = Depends(get_db)
):
    """Submit expert comments and mark a disease record as verified (Admin & Expert only)."""
    record = db.query(DiseaseRecord).filter(DiseaseRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Disease record not found")
        
    record.verified_by_expert = True
    record.expert_comments = req.expert_comments
    db.commit()
    db.refresh(record)
    return record

