"""
Yield Prediction — XGBoost inference module.
Predicts expected crop yield based on historical data, crop type, and soil profile.
"""
import os
import pickle
import numpy as np
from ..core.config import settings


_model = None


def _load_model():
    global _model
    # Guard: skip if already loaded
    if _model is not None:
        return
    model_path = settings.YIELD_MODEL_PATH
    if not os.path.exists(model_path):
        model_path = os.path.join("..", model_path)
    if os.path.exists(model_path):
        with open(model_path, "rb") as f:
            _model = pickle.load(f)
    else:
        _model = None


def predict_yield(
    crop_name: str,
    area_acres: float,
    soil_type: str,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    temperature: float,
    humidity: float,
    rainfall: float,
) -> dict:
    """
    Predict expected yield for a given crop and conditions.

    Returns:
        dict with 'crop_name', 'predicted_yield_quintals', 'yield_per_acre'
    """
    _load_model()

    if _model is None:
        return _fallback_prediction(crop_name, area_acres)

    # Encode soil type as numeric (match training encoding)
    soil_map = {"Red": 0, "Black": 1, "Alluvial": 2, "Clay": 3, "Sandy": 4, "Loamy": 5}
    soil_encoded = soil_map.get(soil_type, 2)

    # Encode crop name (match training encoding)
    crop_map = {
        "Rice": 0, "Maize": 1, "Cotton": 2, "Chickpea": 3,
        "Pigeon Peas": 4, "Groundnut": 5, "Soybean": 6, "Sugarcane": 7,
    }
    crop_encoded = crop_map.get(crop_name, 0)

    features = np.array([[
        crop_encoded, area_acres, soil_encoded,
        nitrogen, phosphorus, potassium,
        temperature, humidity, rainfall,
    ]])

    predicted = float(_model.predict(features)[0])

    return {
        "crop_name": crop_name,
        "predicted_yield_quintals": round(predicted, 2),
        "yield_per_acre": round(predicted / max(area_acres, 0.1), 2),
    }


def _fallback_prediction(crop_name: str, area_acres: float) -> dict:
    """Rule-based fallback yields (Telangana averages)."""
    avg_yields = {
        "Rice": 18.0, "Maize": 25.0, "Cotton": 8.0, "Chickpea": 10.0,
        "Pigeon Peas": 7.0, "Groundnut": 12.0, "Soybean": 10.0, "Sugarcane": 350.0,
    }
    per_acre = avg_yields.get(crop_name, 12.0)
    total = per_acre * area_acres

    return {
        "crop_name": crop_name,
        "predicted_yield_quintals": round(total, 2),
        "yield_per_acre": round(per_acre, 2),
    }
