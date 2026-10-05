"""
Fertilizer Recommendation — Decision Tree inference module.
Recommends fertilizer type and dosage based on crop, soil, and growth stage.
"""
import os
import logging
import numpy as np
from ..core.config import settings

logger = logging.getLogger("farmer_assistant")

_model = None
_bundle = None


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
    global _model, _bundle
    if _model is not None:
        return

    # Check v2 model first, then standard model path
    base_dir = os.path.dirname(settings.FERTILIZER_MODEL_PATH)
    v2_path = os.path.join(base_dir, "fertilizer_recommendation_v2.pkl")
    if not os.path.exists(v2_path):
        v2_path = os.path.join("..", v2_path)

    model_path = v2_path if os.path.exists(v2_path) else settings.FERTILIZER_MODEL_PATH
    if not os.path.exists(model_path):
        model_path = os.path.join("..", model_path)

    obj = _safe_load_pkl(model_path)
    if isinstance(obj, dict):
        _bundle = obj
        _model = obj.get("model")
    else:
        _bundle = None
        _model = obj


# Fertilizer labels in LabelEncoder order (must match training encoding)
FERTILIZER_LABELS = {
    0: "NPK 10:26:26",
    1: "NPK 14:35:14",
    2: "NPK 17:17:17",
    3: "NPK 20:20",
    4: "NPK 28:28",
    5: "DAP (Di-Ammonium Phosphate)",
    6: "Urea",
    7: "MOP (Muriate of Potash)",
}


def recommend_fertilizer(
    crop_name: str,
    soil_type: str,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    crop_stage: str = "Vegetative",
) -> dict:
    """
    Recommend the best fertilizer for given conditions.

    Returns:
        dict with 'fertilizer', 'dosage_kg_per_acre', and 'instructions'
    """
    _load_model()

    if _model is None:
        return _fallback_recommendation(crop_name, nitrogen, phosphorus, potassium, crop_stage)

    try:
        # Check v2 bundle schema: has soil_encoder, crop_encoder, target_encoder, scaler
        if _bundle and "soil_encoder" in _bundle:
            soil_le = _bundle.get("soil_encoder")
            crop_le = _bundle.get("crop_encoder")
            target_enc = _bundle.get("target_encoder")
            scaler = _bundle.get("scaler")

            # Match crop name
            matched_crop = crop_name
            if crop_le and crop_name not in crop_le.classes_:
                for c in crop_le.classes_:
                    if c.lower() in crop_name.lower() or crop_name.lower() in c.lower():
                        matched_crop = c
                        break

            soil_val = int(soil_le.transform([soil_type])[0]) if soil_le and soil_type in soil_le.classes_ else 0
            crop_val = int(crop_le.transform([matched_crop])[0]) if crop_le and matched_crop in crop_le.classes_ else 0

            # Features: ['Temparature', 'Humidity', 'Moisture', 'Soil Type', 'Crop Type', 'Nitrogen', 'Potassium', 'Phosphorous']
            raw_features = np.array([[28.0, 65.0, 50.0, soil_val, crop_val, float(nitrogen), float(potassium), float(phosphorus)]])
            features = scaler.transform(raw_features) if scaler is not None else raw_features
            pred = _model.predict(features)[0]

            if target_enc is not None:
                fertilizer = str(target_enc.inverse_transform([pred])[0])
            else:
                fertilizer = str(pred)

        # Check v1 bundle schema: has label_encoders
        elif _bundle and "label_encoders" in _bundle:
            label_encoders = _bundle.get("label_encoders", {})
            soil_le = label_encoders.get("Soil Type")
            crop_le = label_encoders.get("Crop Type")
            target_enc = _bundle.get("target_encoder")

            soil_val = int(soil_le.transform([soil_type])[0]) if soil_le and soil_type in soil_le.classes_ else 0
            crop_val = int(crop_le.transform([crop_name])[0]) if crop_le and crop_name in crop_le.classes_ else 0

            features = np.array([[28.0, 65.0, 50.0, soil_val, crop_val, float(nitrogen), float(potassium), float(phosphorus)]])
            pred = _model.predict(features)[0]

            if target_enc is not None:
                fertilizer = str(target_enc.inverse_transform([pred])[0])
            else:
                fertilizer = str(pred)
        else:
            # Fallback feature layout
            crop_map = {"Rice": 0, "Maize": 1, "Cotton": 2, "Chickpea": 3, "Pigeon Peas": 4, "Groundnut": 5}
            soil_map = {"Red": 0, "Black": 1, "Alluvial": 2, "Clay": 3, "Sandy": 4, "Loamy": 5}
            stage_map = {"Sowing": 0, "Vegetative": 1, "Flowering": 2, "Harvesting": 3}

            features = np.array([[
                crop_map.get(crop_name, 0),
                soil_map.get(soil_type, 2),
                nitrogen, phosphorus, potassium,
                stage_map.get(crop_stage, 0),
            ]])

            prediction = int(_model.predict(features)[0])
            fertilizer = FERTILIZER_LABELS.get(prediction, f"Fertilizer Type {prediction}")

        return {
            "recommended_fertilizer": fertilizer,
            "fertilizer": fertilizer,
            "dosage_kg_per_acre": 50.0,
            "instructions": f"{crop_stage} దశలో {fertilizer} వాడండి. Apply {fertilizer} during {crop_stage} stage.",
        }
    except Exception as e:
        logger.exception(f"Error in recommend_fertilizer: {e}")
        return _fallback_recommendation(crop_name, nitrogen, phosphorus, potassium, crop_stage)



def _fallback_recommendation(crop_name: str, n: float, p: float, k: float, stage: str) -> dict:
    """Rule-based fertilizer recommendation fallback."""
    if n < 40:
        fert = "Urea"
        dosage = 55.0
        reason = "నత్రజని తక్కువగా ఉంది. Nitrogen is low."
    elif p < 30:
        fert = "DAP (Di-Ammonium Phosphate)"
        dosage = 50.0
        reason = "భాస్వరం తక్కువగా ఉంది. Phosphorus is low."
    elif k < 30:
        fert = "MOP (Muriate of Potash)"
        dosage = 40.0
        reason = "పొటాషియం తక్కువగా ఉంది. Potassium is low."
    else:
        fert = "NPK 20:20:20"
        dosage = 45.0
        reason = "సమతుల్య పోషణ అవసరం. Balanced nutrition needed."

    return {
        "recommended_fertilizer": fert,
        "fertilizer": fert,
        "dosage_kg_per_acre": dosage,
        "instructions": f"{reason} {stage} దశలో {fert} వాడండి. Apply {fert} during {stage} stage.",
    }
