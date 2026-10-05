"""
Crop Recommendation — Random Forest inference module.
Takes soil composition + weather parameters and recommends the best crop.
# Triggered uvicorn reload to load updated models.
"""
import os
import pickle
import numpy as np
from ..core.config import settings


# Global model references (lazy-loaded)
_model = None
_label_encoder = None
_scaler = None


def _safe_load_pkl(path: str):
    """Safely load a pkl artifact using joblib first, then pickle."""
    if not os.path.exists(path):
        return None
    try:
        import joblib
        return joblib.load(path)
    except Exception:
        try:
            with open(path, "rb") as f:
                return pickle.load(f)
        except Exception:
            return None


def _load_model():
    """Load the trained Random Forest model, label encoder, and scaler from disk. Only loads once."""
    global _model, _label_encoder, _scaler
    # Guard: skip if already loaded
    if _model is not None:
        return
    model_path = settings.CROP_RECOMMEND_MODEL_PATH
    if not os.path.exists(model_path):
        model_path = os.path.join("..", model_path)
    
    dir_path = os.path.dirname(model_path)
    encoder_path = os.path.join(dir_path, "crop_label_encoder.pkl")
    scaler_path = os.path.join(dir_path, "crop_scaler.pkl")

    _model = _safe_load_pkl(model_path)
    _label_encoder = _safe_load_pkl(encoder_path)
    _scaler = _safe_load_pkl(scaler_path)


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
    crop_display_names = {
        "Rice": "Rice (Paddy)",
        "Maize": "Maize",
        "Cotton": "Cotton",
        "Chickpea": "Chickpea",
        "Pigeonpeas": "Pigeon Peas",
        "Groundnut": "Groundnut",
        "Soybean": "Soybean",
        "Sugarcane": "Sugarcane",
        "Jute": "Jute",
        "Coffee": "Coffee",
        "Watermelon": "Watermelon",
        "Muskmelon": "Muskmelon",
        "Apple": "Apple",
        "Orange": "Orange",
        "Papaya": "Papaya",
        "Coconut": "Coconut",
        "Pomegranate": "Pomegranate",
        "Mango": "Mango",
        "Banana": "Banana",
        "Blackgram": "Blackgram",
        "Mungbean": "Mungbean",
        "Lentil": "Lentil",
        "Kidneybeans": "Kidney Beans",
        "Mothbeans": "Moth Beans",
    }

    _load_model()

    if _model is None:
        # Model not trained yet — return a rule-based fallback
        return _fallback_recommendation(nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall)

    features = np.array([[nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall]])
    if _scaler is not None:
        features = _scaler.transform(features)

    probabilities = _model.predict_proba(features)[0]
    top_indices = np.argsort(probabilities)[::-1][:4]

    recommendations = []
    for idx in top_indices:
        prob = float(probabilities[idx]) * 100
        class_id = _model.classes_[idx]
        if _label_encoder is not None:
            raw_name = _label_encoder.inverse_transform([class_id])[0]
            c_name = crop_display_names.get(raw_name.lower().title(), raw_name.title())
        else:
            c_name = f"Crop {class_id}"
        recommendations.append({
            "crop_name": c_name,
            "confidence": round(prob, 2),
        })

    recommended_crop = recommendations[0]["crop_name"]
    confidence = recommendations[0]["confidence"]

    return {
        "recommended_crop": recommended_crop,
        "confidence": round(confidence, 2),
        "recommendations": recommendations,
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

    alt1 = "Maize" if crop != "Maize" else "Rice"
    alt2 = "Chickpea" if crop != "Chickpea" else "Cotton"

    return {
        "recommended_crop": crop,
        "confidence": 60.0,  # Low confidence for rule-based
        "recommendations": [
            {"crop_name": crop, "confidence": 60.0},
            {"crop_name": alt1, "confidence": 25.0},
            {"crop_name": alt2, "confidence": 15.0}
        ]
    }
