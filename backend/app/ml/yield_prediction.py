"""
Yield Prediction — XGBoost inference module.
Predicts expected crop yield based on historical data, crop type, and soil profile.
"""
import os
import logging
import numpy as np
from ..core.config import settings

logger = logging.getLogger("farmer_assistant")

_model = None
_crop_encoder = None
_district_encoder = None
_season_encoder = None


def _safe_load_pkl(path: str):
    """Safely load a pkl artifact using joblib first, then pickle."""
    if not os.path.exists(path):
        return None
    try:
        import joblib
        return joblib.load(path)
    except Exception:
        try:
            import pickle
            with open(path, "rb") as f:
                return pickle.load(f)
        except Exception:
            return None


def _load_model():
    """Load trained XGBoost model and encoders from disk (lazy-loaded)."""
    global _model, _crop_encoder, _district_encoder, _season_encoder
    if _model is not None:
        return

    model_path = settings.YIELD_MODEL_PATH
    if not os.path.exists(model_path):
        model_path = os.path.join("..", model_path)

    dir_path = os.path.dirname(model_path)
    _model = _safe_load_pkl(model_path)
    _crop_encoder = _safe_load_pkl(os.path.join(dir_path, "yield_crop_encoder.pkl"))
    _district_encoder = _safe_load_pkl(os.path.join(dir_path, "yield_district_encoder.pkl"))
    _season_encoder = _safe_load_pkl(os.path.join(dir_path, "yield_season_encoder.pkl"))


# Common synonyms mapping to classes in yield_crop_encoder
CROP_SYNONYMS = {
    "Rice": "Rice",
    "Rice (Paddy)": "Rice",
    "Paddy": "Rice",
    "Cotton": "Cotton(lint)",
    "Maize": "Maize",
    "Groundnut": "Groundnut",
    "Chickpea": "Gram",
    "Bengal Gram": "Gram",
    "Pigeon Peas": "Arhar/Tur",
    "Pigeonpeas": "Arhar/Tur",
    "Red Gram": "Arhar/Tur",
    "Soybean": "Soyabean",
    "Sugarcane": "Sugarcane",
    "Banana": "Banana",
    "Mango": "Mango",
    "Coconut": "Coconut",
    "Mungbean": "Moong(Green Gram)",
    "Moong": "Moong(Green Gram)",
    "Blackgram": "Urad",
    "Urad": "Urad",
    "Tomato": "Tomato",
    "Onion": "Onion",
    "Potato": "Potato",
    "Chilli": "Dry chillies",
    "Turmeric": "Turmeric",
}


def predict_yield(
    crop_name: str,
    area_acres: float,
    soil_type: str = "Clay",
    nitrogen: float = 0.0,
    phosphorus: float = 0.0,
    potassium: float = 0.0,
    temperature: float = 0.0,
    humidity: float = 0.0,
    rainfall: float = 0.0,
    district: str = "WARANGAL",
    season: str = "Kharif",
    year: int = 2024,
) -> dict:
    """
    Predict expected yield for a given crop and conditions using the trained XGBoost model.
    Maintains full backwards compatibility with all existing caller parameter signatures.

    Returns:
        dict with 'crop_name', 'predicted_yield_quintals', 'yield_per_acre'
    """
    _load_model()

    if _model is None or _crop_encoder is None or _district_encoder is None or _season_encoder is None:
        return _fallback_prediction(crop_name, area_acres)

    # 1. Resolve crop name
    mapped_crop = CROP_SYNONYMS.get(crop_name)
    if not mapped_crop or mapped_crop not in _crop_encoder.classes_:
        # Try case-insensitive matching
        for c in _crop_encoder.classes_:
            if c.lower() == crop_name.lower():
                mapped_crop = c
                break
    if not mapped_crop or mapped_crop not in _crop_encoder.classes_:
        return _fallback_prediction(crop_name, area_acres)

    # 2. Resolve district
    dist_clean = district.strip().upper()
    if dist_clean not in _district_encoder.classes_:
        dist_clean = "WARANGAL"  # Default baseline district in Telangana

    # 3. Resolve season
    season_clean = season.strip().capitalize()
    if season_clean not in _season_encoder.classes_:
        season_clean = "Kharif"

    try:
        crop_enc = int(_crop_encoder.transform([mapped_crop])[0])
        dist_enc = int(_district_encoder.transform([dist_clean])[0])
        season_enc = int(_season_encoder.transform([season_clean])[0])

        # Convert acres to hectares (1 hectare = 2.47105 acres)
        area_ha = max(0.1, float(area_acres) / 2.47105)

        # Features expected by trained XGBoost: ['Year', 'District_enc', 'Season_enc', 'Crop_enc', 'Area']
        features = np.array([[year, dist_enc, season_enc, crop_enc, area_ha]])
        pred_tonnes_ha = float(_model.predict(features)[0])

        # Convert tonnes/hectare to quintals/acre:
        # 1 tonne = 10 quintals, 1 hectare = 2.47105 acres -> 10 / 2.47105 = 4.04686
        predicted_ypa = max(0.1, pred_tonnes_ha * 4.04686)

        # Crop boundaries for sanity validation (quintals per acre)
        crop_bounds = {
            "Rice": (10.0, 60.0),
            "Maize": (15.0, 80.0),
            "Cotton": (4.0, 25.0),
            "Chickpea": (5.0, 20.0),
            "Pigeon Peas": (3.0, 15.0),
            "Groundnut": (5.0, 25.0),
            "Soybean": (4.0, 20.0),
            "Sugarcane": (150.0, 800.0),
            "Banana": (100.0, 400.0),
            "Mango": (20.0, 100.0),
            "Coconut": (50.0, 200.0)
        }

        min_bound, max_bound = crop_bounds.get(crop_name, (3.0, 150.0))
        clamped_ypa = max(min(predicted_ypa, max_bound), min_bound)
        predicted_total = clamped_ypa * area_acres

        return {
            "crop_name": crop_name,
            "predicted_yield_quintals": round(predicted_total, 2),
            "yield_per_acre": round(clamped_ypa, 2),
        }
    except Exception as e:
        logger.exception(f"Error predicting yield for '{crop_name}': {e}")
        return _fallback_prediction(crop_name, area_acres)


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
