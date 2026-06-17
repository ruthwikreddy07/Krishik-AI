"""
Crops API — CRUD for farmer crops + ML-powered crop recommendation.
"""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.schemas import Crop, Farmer
from ..ml.crop_recommendation import recommend_crop

router = APIRouter(prefix="/api/crops", tags=["Crop Management"])


# ── Pydantic models ─────────────────────────────────────────

class CropCreate(BaseModel):
    farmer_id: int
    crop_name: str
    sowing_date: date
    crop_stage: str = "Sowing"


class CropUpdate(BaseModel):
    crop_stage: str


class CropResponse(BaseModel):
    id: int
    farmer_id: int
    crop_name: str
    sowing_date: date
    crop_stage: str

    class Config:
        from_attributes = True


class CropRecommendRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float


class CropRecommendResponse(BaseModel):
    recommended_crop: str
    confidence: float


# ── Endpoints ───────────────────────────────────────────────

@router.post("/", response_model=CropResponse, status_code=status.HTTP_201_CREATED)
def add_crop(req: CropCreate, db: Session = Depends(get_db)):
    """Add a new crop for a farmer."""
    farmer = db.query(Farmer).filter(Farmer.id == req.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    crop = Crop(
        farmer_id=req.farmer_id,
        crop_name=req.crop_name,
        sowing_date=req.sowing_date,
        crop_stage=req.crop_stage,
    )
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop


@router.get("/{farmer_id}", response_model=list[CropResponse])
def get_crops(farmer_id: int, db: Session = Depends(get_db)):
    """Get all crops belonging to a farmer."""
    crops = db.query(Crop).filter(Crop.farmer_id == farmer_id).all()
    return crops


@router.put("/{crop_id}", response_model=CropResponse)
def update_crop_stage(crop_id: int, req: CropUpdate, db: Session = Depends(get_db)):
    """Update a crop's growth stage (e.g., Sowing → Vegetative → Flowering → Harvesting)."""
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    crop.crop_stage = req.crop_stage
    db.commit()
    db.refresh(crop)
    return crop


@router.post("/recommend", response_model=CropRecommendResponse)
def get_crop_recommendation(req: CropRecommendRequest):
    """ML-powered crop recommendation using Random Forest model."""
    result = recommend_crop(
        nitrogen=req.nitrogen,
        phosphorus=req.phosphorus,
        potassium=req.potassium,
        temperature=req.temperature,
        humidity=req.humidity,
        ph=req.ph,
        rainfall=req.rainfall,
    )
    return result
