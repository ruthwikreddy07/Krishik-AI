"""
Yield Prediction & Fertilizer Recommendation API routes.
"""
from fastapi import APIRouter
from pydantic import BaseModel

from ..ml.yield_prediction import predict_yield
from ..ml.fertilizer_recommendation import recommend_fertilizer

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
def predict_crop_yield(req: YieldPredictRequest):
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
    return result


@router.post("/fertilizer/recommend", response_model=FertilizerResponse)
def get_fertilizer_recommendation(req: FertilizerRequest):
    """Decision Tree-powered fertilizer recommendation."""
    result = recommend_fertilizer(
        crop_name=req.crop_name,
        soil_type=req.soil_type,
        nitrogen=req.nitrogen,
        phosphorus=req.phosphorus,
        potassium=req.potassium,
        crop_stage=req.crop_stage,
    )
    return result
