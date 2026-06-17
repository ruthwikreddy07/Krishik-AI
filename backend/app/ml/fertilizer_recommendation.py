"""
Fertilizer Recommendation — Decision Tree inference module.
Recommends fertilizer type and dosage based on crop, soil, and growth stage.
"""
import os
import pickle
import numpy as np
from ..core.config import settings


_model = None


def _load_model():
    global _model
    model_path = settings.FERTILIZER_MODEL_PATH
    if os.path.exists(model_path):
        with open(model_path, "rb") as f:
            _model = pickle.load(f)
    else:
        _model = None


# Fertilizer labels in LabelEncoder order (must match training encoding)
FERTILIZER_LABELS = {
    0: "NPK 10:26:26",
    1: "NPK 14:35:14",
    2: "NPK 17:17:17",
    3: "NPK 20:20",
    4: "NPK 28:28",
    5: "DAP (Di-Ammonium Phosphate)",
    6: "Urea",
}


def recommend_fertilizer(
    crop_name: str,
    soil_type: str,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    crop_stage: str,
) -> dict:
    """
    Recommend the best fertilizer for given conditions.

    Returns:
        dict with 'fertilizer', 'dosage_kg_per_acre', and 'instructions'
    """
    _load_model()

    if _model is None:
        return _fallback_recommendation(crop_name, nitrogen, phosphorus, potassium, crop_stage)

    # Encode inputs (match training encoding)
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
        "fertilizer": fertilizer,
        "dosage_kg_per_acre": 50.0,
        "instructions": f"{crop_stage} దశలో {fertilizer} వాడండి. Apply {fertilizer} during {crop_stage} stage.",
    }


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
        "fertilizer": fert,
        "dosage_kg_per_acre": dosage,
        "instructions": f"{reason} {stage} దశలో {fert} వాడండి. Apply {fert} during {stage} stage.",
    }
