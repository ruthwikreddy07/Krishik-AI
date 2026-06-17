"""
Market Price Prediction — LSTM inference module.
Time-series forecasting of mandi commodity prices.
"""
import os
import numpy as np
from datetime import datetime, timedelta
from ..core.config import settings


_model = None
_scaler = None


def _load_model():
    global _model, _scaler
    model_path = settings.PRICE_MODEL_PATH
    scaler_path = model_path.replace(".h5", "_scaler.pkl")

    if os.path.exists(model_path):
        try:
            import tensorflow as tf
            import pickle
            _model = tf.keras.models.load_model(model_path)
            if os.path.exists(scaler_path):
                with open(scaler_path, "rb") as f:
                    _scaler = pickle.load(f)
        except ImportError:
            _model = None
    else:
        _model = None


def predict_price(crop_name: str, days_ahead: int = 7) -> dict:
    """
    Predict future market prices for a crop.

    Parameters:
        crop_name: Name of the crop (e.g., "Rice", "Cotton")
        days_ahead: Number of days to predict into the future (1–30)

    Returns:
        dict with 'crop_name', 'predicted_prices' (list), and 'trend'
    """
    _load_model()

    if _model is None:
        return _fallback_prediction(crop_name, days_ahead)

    # TODO: Load recent price history from DB, scale, and feed to LSTM
    # For now, use fallback
    return _fallback_prediction(crop_name, days_ahead)


def _fallback_prediction(crop_name: str, days_ahead: int) -> dict:
    """
    Rule-based price simulation when LSTM model is not yet trained.
    Uses typical Telangana mandi price ranges with slight random variation.
    """
    base_prices = {
        "Rice": 2200.0, "Maize": 1800.0, "Cotton": 6500.0,
        "Chickpea": 5200.0, "Pigeon Peas": 6800.0, "Groundnut": 5500.0,
        "Soybean": 4200.0, "Sugarcane": 3100.0, "Tomato": 1500.0,
        "Chilli": 12000.0, "Turmeric": 8500.0,
    }
    base = base_prices.get(crop_name, 3000.0)

    # Generate simulated price trend
    np.random.seed(hash(crop_name) % 2**32)
    trend_factor = np.random.choice([-1, 0, 1], p=[0.3, 0.4, 0.3])
    prices = []
    current = base

    for i in range(days_ahead):
        noise = np.random.uniform(-0.02, 0.02) * base
        current = current + (trend_factor * base * 0.005) + noise
        current = max(current, base * 0.7)  # Floor at 70% of base
        future_date = (datetime.utcnow() + timedelta(days=i + 1)).strftime("%Y-%m-%d")
        prices.append({"date": future_date, "price": round(current, 2)})

    # Determine overall trend
    if len(prices) >= 2:
        if prices[-1]["price"] > prices[0]["price"] * 1.02:
            trend = "rising"
        elif prices[-1]["price"] < prices[0]["price"] * 0.98:
            trend = "falling"
        else:
            trend = "stable"
    else:
        trend = "stable"

    return {
        "crop_name": crop_name,
        "predicted_prices": prices,
        "trend": trend,
    }
