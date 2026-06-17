"""
Crop Recommendation — Random Forest inference module.
Takes soil composition + weather parameters and recommends the best crop.
"""
import os
import pickle
import numpy as np
from ..core.config import settings


# Global model references (lazy-loaded)
_model = None
_label_encoder = None


def _load_model():
    """Load the trained Random Forest model and label encoder from disk."""
    global _model, _label_encoder
    model_path = settings.CROP_RECOMMEND_MODEL_PATH
    encoder_path = os.path.join(os.path.dirname(model_path), "crop_label_encoder.pkl")

    if os.path.exists(model_path):
        with open(model_path, "rb") as f:
            _model = pickle.load(f)
    else:
        _model = None

    if os.path.exists(encoder_path):
        with open(encoder_path, "rb") as f:
            _label_encoder = pickle.load(f)
    else:
        _label_encoder = None


def recommend_crop(
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    temperature: float,
    humidity: float,
    ph: float,
    rainfall: float,
) -> dict:
    """
    Predict the most suitable crop based on soil and weather inputs.

    Parameters:
        nitrogen, phosphorus, potassium: Soil NPK values (mg/kg)
        temperature: Average temperature (°C)
        humidity: Relative humidity (%)
        ph: Soil pH
        rainfall: Annual rainfall (mm)

    Returns:
        dict with 'recommended_crop' and 'confidence'
    """
    _load_model()

    features = np.array([[nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall]])

    if _model is None:
        # Model not trained yet — return a rule-based fallback
        return _fallback_recommendation(nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall)

    prediction = _model.predict(features)[0]
    probabilities = _model.predict_proba(features)[0]
    confidence = float(max(probabilities)) * 100

    # Decode the label-encoded prediction back to crop name
    if _label_encoder is not None:
        crop_name = _label_encoder.inverse_transform([int(prediction)])[0]
        crop_name = crop_name.title()  # Capitalize nicely (e.g., "rice" -> "Rice")
    elif isinstance(prediction, (int, np.integer)):
        crop_name = str(prediction)
    else:
        crop_name = str(prediction).title()

    return {
        "recommended_crop": crop_name,
        "confidence": round(confidence, 2),
    }


def _fallback_recommendation(n, p, k, temp, humidity, ph, rainfall) -> dict:
    """
    Simple rule-based fallback when the ML model is not yet trained.
    Based on common Telangana crop requirements.
    """
    if rainfall > 200 and temp > 25 and humidity > 70:
        crop = "Rice"
    elif n > 80 and rainfall < 100:
        crop = "Cotton"
    elif temp > 30 and rainfall > 150:
        crop = "Maize"
    elif ph < 6.5 and rainfall > 100:
        crop = "Chickpea"
    else:
        crop = "Pigeon Peas"

    return {
        "recommended_crop": crop,
        "confidence": 60.0,  # Low confidence for rule-based
    }
