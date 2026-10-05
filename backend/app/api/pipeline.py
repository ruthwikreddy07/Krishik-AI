"""
Unified End-to-End Pipeline API — /api/pipeline/run

Chains the four-stage Crop-to-Market pipeline into a single endpoint:
  Stage 1: Crop Recommendation   → Random Forest
  Stage 2: Yield Prediction      → XGBoost
  Stage 3: Price Forecasting     → LSTM / Fallback
  Stage 4: Mandi Optimization    → Net-Return Optimizer
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.schemas import Farmer, MLPrediction
from ..ml.crop_recommendation import recommend_crop
from ..ml.yield_prediction import predict_yield
from ..ml.price_prediction import predict_price
from ..services.mandi_optimizer import optimize_mandi_selection
from .auth import get_current_farmer

logger = logging.getLogger("farmer_assistant")

router = APIRouter(prefix="/api/pipeline", tags=["Crop-to-Market Pipeline"])


# ── Request / Response Models ────────────────────────────────

class PipelineRequest(BaseModel):
    """All inputs the farmer provides to trigger the full pipeline."""
    # Soil composition (required for Stage 1 + Stage 2)
    nitrogen: float = Field(..., description="Soil nitrogen (N) in mg/kg")
    phosphorus: float = Field(..., description="Soil phosphorus (P) in mg/kg")
    potassium: float = Field(..., description="Soil potassium (K) in mg/kg")

    # Weather (required for Stage 1 + Stage 2)
    temperature: float = Field(..., description="Average temperature (°C)")
    humidity: float = Field(..., description="Relative humidity (%)")
    rainfall: float = Field(..., description="Annual rainfall (mm)")

    # Soil & land (required for Stage 2)
    ph: float = Field(..., description="Soil pH")
    soil_type: str = Field(..., description="Soil type (Red, Black, Alluvial, Clay, Sandy, Loamy)")
    area_acres: float = Field(..., description="Farm area in acres")

    # Location (required for Stage 4 — mandi optimization)
    farmer_lat: float = Field(..., description="Farmer GPS latitude")
    farmer_lon: float = Field(..., description="Farmer GPS longitude")

    # Optional overrides
    crop_override: Optional[str] = Field(
        None,
        description="Skip Stage 1 and use this crop name directly (e.g., 'Rice', 'Cotton')"
    )
    days_ahead: int = Field(7, ge=1, le=30, description="Price forecast horizon in days")
    top_mandis: int = Field(10, ge=1, le=50, description="Number of top mandis to return")
    freight_rate: Optional[float] = Field(
        None,
        description="Custom freight rate (₹/quintal-km). Defaults to 0.30 from transport_config.json"
    )


class StageResult(BaseModel):
    """Individual stage output wrapper."""
    stage: int
    name: str
    status: str  # "success" | "fallback" | "skipped" | "error"
    data: dict


class PipelineResponse(BaseModel):
    """Full pipeline response with all stage outputs."""
    pipeline_status: str  # "success" | "partial" | "error"
    recommended_crop: str
    predicted_yield_quintals: float
    predicted_price_per_quintal: float
    best_mandi: Optional[dict] = None
    net_return_inr: Optional[float] = None
    stages: list[StageResult]
    summary: str


# ── Pipeline Endpoint ────────────────────────────────────────

@router.post("/run", response_model=PipelineResponse)
def run_pipeline(
    req: PipelineRequest,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db),
):
    """
    Execute the complete Crop-to-Market decision pipeline.

    This chains 4 ML stages together:
      1. **Crop Recommendation** (or override) → best crop for the soil/weather
      2. **Yield Prediction** → expected harvest in quintals
      3. **Price Forecasting** → predicted ₹/quintal for that crop
      4. **Mandi Optimization** → which APMC mandi maximizes net return

    Returns a unified response with each stage's output and the final recommendation.
    """
    stages: list[StageResult] = []
    errors = []

    # ─── Stage 1: Crop Recommendation ─────────────────────────
    if req.crop_override:
        crop_name = req.crop_override
        stage1 = StageResult(
            stage=1,
            name="Crop Recommendation",
            status="skipped",
            data={
                "note": f"Farmer override — using '{crop_name}' directly.",
                "recommended_crop": crop_name,
                "confidence": 100.0,
            },
        )
    else:
        try:
            crop_result = recommend_crop(
                nitrogen=req.nitrogen,
                phosphorus=req.phosphorus,
                potassium=req.potassium,
                temperature=req.temperature,
                humidity=req.humidity,
                ph=req.ph,
                rainfall=req.rainfall,
            )
            crop_name = crop_result["recommended_crop"]
            stage1 = StageResult(
                stage=1,
                name="Crop Recommendation",
                status="success",
                data=crop_result,
            )
        except Exception as e:
            logger.exception("Pipeline Stage 1 (Crop Recommendation) failed:")
            crop_name = "Rice"  # Safe fallback for Telangana
            errors.append(f"Stage 1: {str(e)}")
            stage1 = StageResult(
                stage=1,
                name="Crop Recommendation",
                status="error",
                data={"error": str(e), "fallback_crop": crop_name},
            )
    stages.append(stage1)

    # Normalize display names from Stage 1 back to model-compatible names.
    # crop_recommendation.py returns display names like "Rice (Paddy)" but
    # yield_prediction.py and price_prediction.py expect "Rice".
    _DISPLAY_TO_MODEL_NAME = {
        "Rice (Paddy)": "Rice",
        "Kidney Beans": "Kidneybeans",
        "Moth Beans": "Mothbeans",
        "Pigeon Peas": "Pigeon Peas",  # already compatible
    }
    crop_display_name = crop_name  # preserve original for responses
    crop_name = _DISPLAY_TO_MODEL_NAME.get(crop_name, crop_name)

    # ─── Stage 2: Yield Prediction ────────────────────────────
    try:
        yield_result = predict_yield(
            crop_name=crop_name,
            area_acres=req.area_acres,
            soil_type=req.soil_type,
            nitrogen=req.nitrogen,
            phosphorus=req.phosphorus,
            potassium=req.potassium,
            temperature=req.temperature,
            humidity=req.humidity,
            rainfall=req.rainfall,
        )
        predicted_quintals = yield_result["predicted_yield_quintals"]
        stage2 = StageResult(
            stage=2,
            name="Yield Prediction",
            status="success",
            data=yield_result,
        )
    except Exception as e:
        logger.exception("Pipeline Stage 2 (Yield Prediction) failed:")
        predicted_quintals = req.area_acres * 18.0  # Safe fallback: 18 quintals/acre
        errors.append(f"Stage 2: {str(e)}")
        stage2 = StageResult(
            stage=2,
            name="Yield Prediction",
            status="error",
            data={"error": str(e), "fallback_quintals": predicted_quintals},
        )
    stages.append(stage2)

    # ─── Stage 3: Price Forecasting ───────────────────────────
    try:
        price_result = predict_price(
            crop_name=crop_name,
            days_ahead=req.days_ahead,
        )
        # Use the average predicted price across the forecast window
        predicted_prices = price_result.get("predicted_prices", [])
        if predicted_prices:
            avg_price = sum(p["price"] for p in predicted_prices) / len(predicted_prices)
        else:
            avg_price = 2500.0  # Safe fallback
        stage3 = StageResult(
            stage=3,
            name="Price Forecasting",
            status="success",
            data={
                **price_result,
                "average_predicted_price": round(avg_price, 2),
            },
        )
    except Exception as e:
        logger.exception("Pipeline Stage 3 (Price Forecasting) failed:")
        avg_price = 2500.0
        errors.append(f"Stage 3: {str(e)}")
        stage3 = StageResult(
            stage=3,
            name="Price Forecasting",
            status="error",
            data={"error": str(e), "fallback_price": avg_price},
        )
    stages.append(stage3)

    # ─── Stage 4: Mandi Optimization ──────────────────────────
    try:
        mandi_result = optimize_mandi_selection(
            farmer_lat=req.farmer_lat,
            farmer_lon=req.farmer_lon,
            predicted_price=avg_price,
            predicted_quantity_quintals=predicted_quintals,
            top_n=req.top_mandis,
            freight_rate_override=req.freight_rate,
        )
        best_mandi = mandi_result.get("best_mandi")
        net_return = best_mandi["net_return_inr"] if best_mandi else None
        stage4 = StageResult(
            stage=4,
            name="Mandi Optimization",
            status="success",
            data=mandi_result,
        )
    except Exception as e:
        logger.exception("Pipeline Stage 4 (Mandi Optimization) failed:")
        best_mandi = None
        net_return = None
        errors.append(f"Stage 4: {str(e)}")
        stage4 = StageResult(
            stage=4,
            name="Mandi Optimization",
            status="error",
            data={"error": str(e)},
        )
    stages.append(stage4)

    # ─── Persist pipeline result as an ML prediction ──────────
    if current_farmer:
        try:
            best_name = best_mandi["mandi_name"] if best_mandi else "N/A"
            prediction = MLPrediction(
                farmer_id=current_farmer.id,
                prediction_type="pipeline",
                input_summary=(
                    f"Crop:{crop_name} Area:{req.area_acres}ac "
                    f"Soil:{req.soil_type} Loc:({req.farmer_lat},{req.farmer_lon})"
                ),
                result_summary=(
                    f"{crop_name} → {predicted_quintals:.1f}q @ ₹{avg_price:.0f}/q "
                    f"→ Best Mandi: {best_name}"
                ),
                result_data={
                    "crop": crop_name,
                    "yield_quintals": predicted_quintals,
                    "price_per_quintal": avg_price,
                    "best_mandi": best_mandi,
                    "net_return": net_return,
                },
            )
            db.add(prediction)
            db.commit()
        except Exception:
            db.rollback()

    # ─── Build Summary ────────────────────────────────────────
    pipeline_status = "success" if not errors else ("partial" if len(errors) < 4 else "error")

    if best_mandi and net_return is not None:
        summary = (
            f"Based on your soil and weather conditions, we recommend growing **{crop_display_name}**. "
            f"Expected harvest: **{predicted_quintals:.1f} quintals** from {req.area_acres} acres. "
            f"Predicted market price: **₹{avg_price:.0f}/quintal**. "
            f"Best mandi to sell at: **{best_mandi['mandi_name']}** "
            f"({best_mandi['district']}, {best_mandi['distance_km']} km away) "
            f"with an estimated net return of **₹{net_return:,.0f}**."
        )
    else:
        summary = (
            f"Recommended crop: **{crop_display_name}**. "
            f"Expected yield: **{predicted_quintals:.1f} quintals**. "
            f"Predicted price: **₹{avg_price:.0f}/quintal**. "
            f"Mandi optimization could not be completed — check GPS coordinates."
        )

    return PipelineResponse(
        pipeline_status=pipeline_status,
        recommended_crop=crop_display_name,
        predicted_yield_quintals=round(predicted_quintals, 2),
        predicted_price_per_quintal=round(avg_price, 2),
        best_mandi=best_mandi,
        net_return_inr=round(net_return, 2) if net_return is not None else None,
        stages=stages,
        summary=summary,
    )
