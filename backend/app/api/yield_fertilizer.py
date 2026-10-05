"""
Yield Prediction & Fertilizer Recommendation API routes.
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.schemas import Farmer, MLPrediction
from ..ml.yield_prediction import predict_yield
from ..ml.fertilizer_recommendation import recommend_fertilizer
from .auth import get_current_farmer

logger = logging.getLogger("farmer_assistant")

router = APIRouter(prefix="/api", tags=["Yield & Fertilizer"])


# ── Pydantic models ─────────────────────────────────────────

class YieldPredictRequest(BaseModel):
    crop_name: str
    area_acres: float
    soil_type: str
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    rainfall: float


class YieldPredictResponse(BaseModel):
    crop_name: str
    predicted_yield_quintals: float
    yield_per_acre: float


class FertilizerRequest(BaseModel):
    crop_name: str
    soil_type: str
    nitrogen: float
    phosphorus: float
    potassium: float
    crop_stage: str


class FertilizerResponse(BaseModel):
    fertilizer: str
    dosage_kg_per_acre: float
    instructions: str


# ── Endpoints ───────────────────────────────────────────────

@router.post("/yield/predict", response_model=YieldPredictResponse)
def predict_crop_yield(
    req: YieldPredictRequest,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """XGBoost-powered yield prediction."""
    result = predict_yield(
        crop_name=req.crop_name,
        area_acres=req.area_acres,
        soil_type=req.soil_type,
        nitrogen=req.nitrogen,
        phosphorus=req.phosphorus,
        potassium=req.potassium,
        temperature=req.temperature,
        humidity=req.humidity,
        rainfall=req.rainfall,
    )

    # Save prediction to ml_predictions for AI assistant context
    if current_farmer:
        try:
            prediction = MLPrediction(
                farmer_id=current_farmer.id,
                prediction_type="yield",
                input_summary=f"Crop:{req.crop_name} Area:{req.area_acres}ac Soil:{req.soil_type}",
                result_summary=f"{result['predicted_yield_quintals']:.1f} quintals ({result['yield_per_acre']:.1f}/acre) for {req.crop_name}",
                result_data=result,
            )
            db.add(prediction)
            db.commit()
        except Exception:
            db.rollback()

    return result


@router.post("/fertilizer/recommend", response_model=FertilizerResponse)
def get_fertilizer_recommendation(
    req: FertilizerRequest,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Decision Tree-powered fertilizer recommendation."""
    result = recommend_fertilizer(
        crop_name=req.crop_name,
        soil_type=req.soil_type,
        nitrogen=req.nitrogen,
        phosphorus=req.phosphorus,
        potassium=req.potassium,
        crop_stage=req.crop_stage,
    )

    # Save prediction to ml_predictions for AI assistant context
    if current_farmer:
        try:
            prediction = MLPrediction(
                farmer_id=current_farmer.id,
                prediction_type="fertilizer",
                input_summary=f"Crop:{req.crop_name} Soil:{req.soil_type} N:{req.nitrogen} P:{req.phosphorus} K:{req.potassium} Stage:{req.crop_stage}",
                result_summary=f"{result['fertilizer']} @ {result['dosage_kg_per_acre']}kg/acre",
                result_data=result,
            )
            db.add(prediction)
            db.commit()
        except Exception:
            db.rollback()

    return result
