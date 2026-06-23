"""
Pest Prediction API — local pest risk assessment based on farmer profile and weather forecast.
"""
import httpx
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.schemas import Farmer, UserActivity, Crop
from .auth import get_current_farmer
from ..ml.pest_prediction import predict_pest_risk

logger = logging.getLogger("farmer_assistant")
router = APIRouter(prefix="/api/pest", tags=["Pest Outbreak Risk Predictor"])

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


class WeatherContext(BaseModel):
    temperature: float
    humidity: float
    rainfall: float


class PestPredictionResponse(BaseModel):
    crop_name: str
    predicted_pest: str
    risk_level: str
    confidence: float
    prevention: list[str]
    chemical_treatment: str
    biological_treatment: str
    weather_context: WeatherContext


@router.get("/predict/{farmer_id}", response_model=list[PestPredictionResponse])
async def get_pest_prediction(
    farmer_id: int,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """
    Generate ML-based pest outbreak warnings for all active crops of a farmer
    using 7-day hyperlocal weather forecasts.
    """
    if current_farmer.id != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: you can only run predictions for your own profile"
        )

    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Fetch active crops
    crops = db.query(Crop).filter(Crop.farmer_id == farmer_id).all()
    if not crops:
        # If no active crops, return a general prediction for Cotton and Rice as fallbacks
        crops = [
            Crop(crop_name="Rice", crop_stage="Vegetative"),
            Crop(crop_name="Cotton", crop_stage="Vegetative")
        ]

    # Resolve coordinates
    lat = float(farmer.latitude) if farmer.latitude else 17.0575
    lon = float(farmer.longitude) if farmer.longitude else 79.2671

    # Fetch weather forecast from Open-Meteo
    temp = 28.0
    humidity = 65.0
    rain_sum = 0.0

    try:
        params = {
            "latitude": lat,
            "longitude": lon,
            "daily": "temperature_2m_max,temperature_2m_min,rain_sum",
            "hourly": "relative_humidity_2m",
            "timezone": "auto",
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(OPEN_METEO_URL, params=params)
            if resp.status_code == 200:
                data = resp.json()
                daily = data.get("daily", {})
                hourly = data.get("hourly", {})

                # Compute average temp of next 7 days
                tmax_list = daily.get("temperature_2m_max", [30]*7)
                tmin_list = daily.get("temperature_2m_min", [22]*7)
                temp = sum(tmax_list + tmin_list) / (len(tmax_list) * 2)

                # Compute average relative humidity of next 7 days
                humidity_list = hourly.get("relative_humidity_2m", [65]*168)
                humidity = sum(humidity_list) / len(humidity_list)

                # Compute total rainfall sum of next 7 days
                rain_sum = sum(daily.get("rain_sum", [0]*7))
    except Exception as e:
        logger.error(f"Failed to fetch weather in Pest API: {e}")

    predictions = []
    for c in crops:
        res = predict_pest_risk(c.crop_name, temp, humidity, rain_sum)
        predictions.append(res)

    # Log activity
    activity = UserActivity(
        farmer_id=farmer_id,
        action="Pest Outbreak Risk Predictor Run",
        channel="Web",
        request_data=f"Crops: {', '.join([c.crop_name for c in crops])} | Coords: {lat},{lon}"
    )
    db.add(activity)
    db.commit()

    return predictions
