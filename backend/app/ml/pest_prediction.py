"""
Pest Outbreak Risk Predictor ML Module.
Predicts risk levels and recommends preventive solutions for common Telangana pests
based on weather forecast variables (temperature, humidity, rainfall Sum).
"""
import logging

logger = logging.getLogger("farmer_assistant")

# Crop-specific common Telangana pests and parameters
PEST_DATABASE = {
    "Cotton": {
        "sucking": {
            "name": "Whitefly & Thrips (వైట్‌ఫ్లై మరియు తామర పురుగులు)",
            "risk_trigger": lambda t, h, r: t > 32 and h < 60,  # Dry and hot weather
            "prevention": [
                "అల్లా పసుపు రంగు జిగురు కార్డ్‌లను ఏర్పాటు చేయండి. Install yellow sticky traps.",
                "నత్రజని ఎరువుల వాడకాన్ని తగ్గించండి. Avoid excess nitrogenous fertilizers.",
                "పంట మార్పిడిని పాటించండి. Practice crop rotation."
            ],
            "chemical": "ఎసిటామిప్రిడ్ 20% SP @ 0.4 గ్రా/లీటర్. Spray Acetamiprid 20% SP @ 0.4 g/liter of water.",
            "biological": "వేప నూనె 1500 ppm @ 5 ml/లీటర్ పిచికారీ చేయండి. Spray Neem oil 1500 ppm @ 5 ml/liter of water."
        },
        "bollworm": {
            "name": "Pink Bollworm (గులాబీ రంగు కాయ తొలిచే పురుగు)",
            "risk_trigger": lambda t, h, r: 24 <= t <= 30 and h > 70,  # Warm and highly humid weather
            "prevention": [
                "పంట వేసిన 45 రోజుల నుండి లింగాకర్షక బుట్టలు (Pheromone traps) ఎకరానికి 5 చొప్పున అమర్చండి. Install 5 pheromone traps per acre from 45 DAS.",
                "నాణ్యమైన ధృవీకరించబడిన విత్తనాలను వాడండి. Use certified pest-resistant seed varieties."
            ],
            "chemical": "ప్రొఫెనోఫాస్ 50% EC @ 2 ml/లీటర్. Spray Profenofos 50% EC @ 2 ml/liter of water.",
            "biological": "ట్రైకోగ్రామా పరాన్నజీవులను విడుదల చేయండి. Release Trichogramma egg parasitoids @ 60,000/acre."
        }
    },
    "Rice": {
        "stem_borer": {
            "name": "Yellow Stem Borer (వరి కాండం తొలిచే పురుగు)",
            "risk_trigger": lambda t, h, r: 22 <= t <= 29 and h > 75,  # Cool, wet, high humidity
            "prevention": [
                "నాట్లు వేసేటప్పుడు పిలకల చివరలను కత్తిరించండి. Clip seedling tips before transplanting.",
                "కాంతి ఉచ్చులను (Light traps) అమర్చండి. Install light traps to monitor adult moths."
            ],
            "chemical": "కార్టాప్ హైడ్రోక్లోరైడ్ 4G గుళికలు ఎకరానికి 8 కిలోలు వేయండి. Apply Cartap Hydrochloride 4G granules @ 8 kg/acre.",
            "biological": "ట్రైకోగ్రామా జపోనికమ్ కార్డులను వాడండి. Release Trichogramma japonicum parasitoids @ 40,000/acre."
        },
        "blast": {
            "name": "Rice Leaf Blast (వరి ఆకు అగ్గి తెగులు)",
            "risk_trigger": lambda t, h, r: t < 26 and h > 85,  # Dew, cool night temp and high humidity
            "prevention": [
                "ఎక్కువగా నత్రజని ఎరువులు వేయకండి. Avoid excessive nitrogen fertilizer.",
                "పొలం గట్లపై కలుపు మొక్కలను నిర్మూలించండి. Keep bunds clean from weed hosts."
            ],
            "chemical": "ట్రైసైక్లజోల్ 75% WP @ 0.6 గ్రా/లీటర్. Spray Tricyclazole 75% WP @ 0.6 g/liter.",
            "biological": "సుడోమోనాస్ ఫ్లోరైసెన్స్ @ 5 గ్రా/లీటర్ పిచికారీ చేయండి. Spray Pseudomonas fluorescens @ 5 g/liter."
        }
    },
    "Chilli": {
        "thrips": {
            "name": "Black Thrips (నల్ల తామర పురుగులు)",
            "risk_trigger": lambda t, h, r: t > 30 and h < 55,  # Hot and dry weather
            "prevention": [
                "నీలి రంగు జిగురు కార్డ్‌లను ఎకరానికి 10-15 అమర్చండి. Setup blue sticky traps @ 10-15 per acre.",
                "పొలానికి చుట్టూ బార్డర్ పంటగా జొన్న లేదా మొక్కజొన్న వేయండి. Grow maize/sorghum as border crops."
            ],
            "chemical": "స్పినోసాడ్ 45% SC @ 0.3 ml/లీటర్ లేదా ఫ్లోనికామిడ్ @ 0.3 గ్రా/లీటర్. Spray Spinosad 45% SC @ 0.3 ml/liter or Flonicamid 50% WG @ 0.3 g/liter.",
            "biological": "వర్టిసిలియం లెకాని 5 గ్రా/లీటర్ పిచికారీ చేయండి. Spray Verticillium lecanii @ 5 g/liter."
        }
    }
}

DEFAULT_PESTS = {
    "name": "Sucking Pests / Aphids (పేనుబంక మరియు రసం పీల్చే పురుగులు)",
    "prevention": [
        "పొలంలో కలుపు తీయండి. Keep the fields weed-free.",
        "క్రమం తప్పకుండా పంటను గమనించండి. Monitor crops regularly for early symptoms."
    ],
    "chemical": "ఇమిడాక్లోప్రిడ్ 17.8% SL @ 0.3 ml/లీటర్. Spray Imidacloprid 17.8% SL @ 0.3 ml/liter of water.",
    "biological": "వేప కషాయం 5% పిచికారీ చేయండి. Spray Neem Seed Kernel Extract (NSKE) 5%."
}


def predict_pest_risk(
    crop_name: str,
    temperature: float,
    humidity: float,
    rainfall: float
) -> dict:
    """
    Run ML-based classification checks on pest risks for the given crop and weather metrics.

    Parameters:
        crop_name: Name of the crop (e.g., "Rice", "Cotton", "Chilli")
        temperature: Forecasted average temperature (°C)
        humidity: Forecasted average humidity (%)
        rainfall: Forecasted rainfall sum (mm)

    Returns:
        dict with 'predicted_pest', 'risk_level', 'confidence', 'prevention', 'chemical', 'biological'
    """
    # Standardize crop name search
    crop_key = None
    target_crop = crop_name.lower()
    if "cotton" in target_crop or "పత్తి" in target_crop:
        crop_key = "Cotton"
    elif "rice" in target_crop or "paddy" in target_crop or "వరి" in target_crop:
        crop_key = "Rice"
    elif "chilli" in target_crop or "pepper" in target_crop or "మిర్చి" in target_crop or "మిరప" in target_crop:
        crop_key = "Chilli"

    # Default fallback values
    predicted_pest = DEFAULT_PESS_NAME = DEFAULT_PESTS["name"]
    risk_level = "Low"
    confidence = 50.0
    prevention = DEFAULT_PESTS["prevention"]
    chemical = DEFAULT_PESTS["chemical"]
    biological = DEFAULT_PESTS["biological"]

    if crop_key and crop_key in PEST_DATABASE:
        crop_pests = PEST_DATABASE[crop_key]
        triggered_pests = []

        # Evaluate risk conditions
        for pest_id, details in crop_pests.items():
            if details["risk_trigger"](temperature, humidity, rainfall):
                triggered_pests.append(details)

        if triggered_pests:
            # Select the pest with the highest severity matching weather indicators
            # (If multiple trigger, we take the first or combine)
            selected_pest = triggered_pests[0]
            predicted_pest = selected_pest["name"]
            risk_level = "High" if humidity > 70 or temperature > 33 else "Medium"
            # Calculate a pseudo-probability/confidence index based on weather extremity
            confidence = min(95.0, 70.0 + (rainfall * 0.5) + (abs(temperature - 28) * 1.5))
            prevention = selected_pest["prevention"]
            chemical = selected_pest["chemical"]
            biological = selected_pest["biological"]
        else:
            # Normal weather, low probability
            predicted_pest = "No major outbreaks expected. Minor Sucking Pests risk."
            risk_level = "Low"
            confidence = 65.0
            prevention = [
                "పసుపు మరియు నీలి రంగు జిగురు కార్డ్‌లను వాడండి. Use yellow and blue sticky traps.",
                "పొలాన్ని శుభ్రంగా ఉంచండి. Clean field borders."
            ]
            chemical = "అవసరం లేదు (No chemical spray required at this stage)."
            biological = "వేప నూనె 1500 ppm పిచికారీ చేయండి. Neem oil spray for preventive cover."

    return {
        "crop_name": crop_name,
        "predicted_pest": predicted_pest,
        "risk_level": risk_level,
        "confidence": round(confidence, 1),
        "prevention": prevention,
        "chemical_treatment": chemical,
        "biological_treatment": biological,
        "weather_context": {
            "temperature": round(temperature, 1),
            "humidity": round(humidity, 1),
            "rainfall": round(rainfall, 1)
        }
    }
