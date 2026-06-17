"""
Disease Detection — CNN inference module.
Accepts a crop leaf image path and returns the predicted disease + treatment.
"""
import logging
import os
import numpy as np
from PIL import Image
from ..core.config import settings

logger = logging.getLogger("farmer_assistant")


# Global model reference (lazy-loaded)
_model = None
IMG_SIZE = (224, 224)  # Standard input size for most CNN architectures


# Disease class labels (PlantVillage dataset — common Telangana crops)
DISEASE_CLASSES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Corn_(maize)___Cercospora_leaf_spot", "Corn_(maize)___Common_rust", "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy",
    "Cotton___Bacterial_blight", "Cotton___Curl_virus", "Cotton___Fussarium_wilt", "Cotton___healthy",
    "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight", "Grape___healthy",
    "Rice___Brown_spot", "Rice___Hispa", "Rice___Leaf_blast", "Rice___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites", "Tomato___Target_Spot", "Tomato___healthy",
]

# Treatment lookup — maps disease names to recommended treatments
TREATMENT_MAP = {
    "Apple___Apple_scab": "ఫంగిసైడ్ స్ప్రే వాడండి (మాంకోజెబ్). Apply Mancozeb fungicide spray.",
    "Corn_(maize)___Common_rust": "ట్రైడెమార్ఫ్ ఫంగిసైడ్ వాడండి. Apply Tridemorph fungicide.",
    "Corn_(maize)___Northern_Leaf_Blight": "ప్రోపికోనజోల్ ఫంగిసైడ్ స్ప్రే చేయండి. Spray Propiconazole fungicide.",
    "Cotton___Bacterial_blight": "కాపర్ ఆక్సీక్లోరైడ్ వాడండి. Apply Copper Oxychloride.",
    "Cotton___Curl_virus": "వైట్‌ఫ్లై నివారణకు ఇమిడాక్లోప్రిడ్ వాడండి. Use Imidacloprid for whitefly control.",
    "Cotton___Fussarium_wilt": "బెనోమిల్ ఫంగిసైడ్ వాడండి, పంట మార్పిడి చేయండి. Apply Benomyl, practice crop rotation.",
    "Rice___Brown_spot": "మాంకోజెబ్ ఫంగిసైడ్ స్ప్రే చేయండి. Spray Mancozeb fungicide.",
    "Rice___Hispa": "క్లోర్పైరిఫాస్ స్ప్రే చేయండి. Spray Chlorpyrifos insecticide.",
    "Rice___Leaf_blast": "ట్రైసైక్లజోల్ ఫంగిసైడ్ వాడండి. Apply Tricyclazole fungicide.",
    "Tomato___Early_blight": "మాంకోజెబ్ లేదా క్లోరోథాలొనిల్ స్ప్రే చేయండి. Spray Mancozeb or Chlorothalonil.",
    "Tomato___Late_blight": "మెటాలాక్సిల్ ఫంగిసైడ్ వాడండి. Apply Metalaxyl fungicide.",
    "Tomato___Leaf_Mold": "వెంటిలేషన్ పెంచండి, మాంకోజెబ్ స్ప్రే చేయండి. Improve ventilation, spray Mancozeb.",
}

DEFAULT_TREATMENT = "వ్యవసాయ నిపుణులను సంప్రదించండి. Please consult an agricultural expert for specific treatment."


_disease_classes = None


def _load_model():
    """Load the trained CNN model (TensorFlow/Keras .h5 file). Only loads once."""
    global _model, _disease_classes
    # Guard: skip if already loaded (or already tried and failed)
    if _model is not None:
        return
    model_path = settings.DISEASE_MODEL_PATH
    class_mapping_path = os.path.join(os.path.dirname(model_path), "disease_classes.json")

    if os.path.exists(model_path):
        try:
            import tensorflow as tf
            _model = tf.keras.models.load_model(model_path)
            if os.path.exists(class_mapping_path):
                import json
                with open(class_mapping_path, "r") as f:
                    # disease_classes.json maps "0": "class_name", "1": "class_name", etc.
                    mapping = json.load(f)
                    # Convert to sorted list of class names based on keys
                    _disease_classes = [mapping[str(i)] for i in range(len(mapping))]
        except Exception:
            logger.exception("Failed to load disease detection model from %s:", model_path)
            _model = None
    else:
        _model = None


def detect_disease(image_path: str) -> dict:
    """
    Run disease detection on a crop leaf image.

    Parameters:
        image_path: Path to the uploaded image file.

    Returns:
        dict with 'disease_name', 'confidence', and 'treatment'
    """
    _load_model()

    if _model is None:
        # Model not trained yet — return a placeholder result
        return _fallback_detection(image_path)

    # Preprocess the image
    # Convert to RGB to handle RGBA (PNG), grayscale, and other modes.
    # The CNN expects exactly 3 channels — RGBA would cause a shape mismatch.
    img = Image.open(image_path).convert("RGB").resize(IMG_SIZE)
    img_array = np.array(img) / 255.0  # Normalize to [0, 1]
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension

    # Predict
    predictions = _model.predict(img_array)[0]
    predicted_idx = int(np.argmax(predictions))
    confidence = float(predictions[predicted_idx]) * 100

    classes = _disease_classes if _disease_classes is not None else DISEASE_CLASSES
    if predicted_idx < len(classes):
        disease_name = classes[predicted_idx]
    else:
        disease_name = f"Unknown Disease (Index {predicted_idx})"
        
    treatment = TREATMENT_MAP.get(disease_name, DEFAULT_TREATMENT)

    # Clean up the label for display
    display_name = disease_name.replace("___", " — ").replace("_", " ")

    return {
        "disease_name": display_name,
        "confidence": round(confidence, 2),
        "treatment": treatment,
    }



def _fallback_detection(image_path: str) -> dict:
    """Placeholder when the CNN model is not available."""
    return {
        "disease_name": "Model Not Trained",
        "confidence": 0.0,
        "treatment": (
            "ML మోడల్ ఇంకా శిక్షణ పొందలేదు. దయచేసి ml_training/disease_detection/ నోట్‌బుక్‌ను అమలు చేయండి. "
            "ML model not yet trained. Please run the training notebook in ml_training/disease_detection/."
        ),
    }
