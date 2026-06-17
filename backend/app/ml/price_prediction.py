"""
Market Price Prediction — LSTM inference module.
Time-series forecasting of mandi commodity prices.
"""
import os
import pickle
import logging
import numpy as np
from datetime import datetime, timedelta, timezone

from ..core.config import settings
from ..core.database import SessionLocal
from ..models.schemas import MarketPrice

logger = logging.getLogger("farmer_assistant")

_model = None
_scaler = None


def _load_model():
    global _model, _scaler
    if _model is not None:
        return

    model_path = settings.PRICE_MODEL_PATH
    if not os.path.exists(model_path):
        model_path = os.path.join("..", model_path)
    scaler_path = model_path.replace(".h5", "_scaler.pkl")

    if os.path.exists(model_path):
        try:
            import tensorflow as tf
            _model = tf.keras.models.load_model(model_path, compile=False)
            if os.path.exists(scaler_path):
                with open(scaler_path, "rb") as f:
                    _scaler = pickle.load(f)
        except Exception as e:
            logger.exception(f"Failed to load price prediction model from {model_path}:")
            _model = None
            _scaler = None
    else:
        _model = None
        _scaler = None


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

    if _model is None or _scaler is None:
        logger.warning("LSTM price model or scaler not loaded. Using fallback simulation.")
        return _fallback_prediction(crop_name, days_ahead)

    # 1. Fetch recent price history from DB (need last 30 days)
    db = SessionLocal()
    try:
        # Standardize search term: map common terms
        mapped_names = [crop_name, crop_name.lower(), crop_name.title()]
        if crop_name.lower() in ("rice", "paddy"):
            mapped_names.extend(["Paddy (Dhan)(Common)", "paddy (dhan)(common)", "Rice"])
        elif crop_name.lower() == "cotton":
            mapped_names.extend(["Cotton", "cotton"])
        elif crop_name.lower() == "maize":
            mapped_names.extend(["Maize", "maize"])
        elif crop_name.lower() == "groundnut":
            mapped_names.extend(["Groundnut", "groundnut"])

        records = (
            db.query(MarketPrice)
            .filter(MarketPrice.crop_name.in_(mapped_names))
            .order_by(MarketPrice.price_date.desc())
            .limit(30)
            .all()
        )
        # Sort ascending chronologically
        records = list(reversed(records))
    except Exception as e:
        logger.exception(f"Error querying market prices for crop '{crop_name}':")
        records = []
    finally:
        db.close()

    # 2. Verify we have exactly 30 records for the sequence lookback
    if len(records) < 30:
        logger.info(f"Insufficient DB price records ({len(records)}/30) for LSTM. Using fallback.")
        return _fallback_prediction(crop_name, days_ahead)

    # 3. Extract and scale history sequence
    try:
        hist_prices = np.array([float(r.price) for r in records]).reshape(-1, 1)
        scaled_seq = _scaler.transform(hist_prices)  # shape (30, 1)

        # 4. Perform autoregressive prediction
        current_seq = scaled_seq.copy()
        predictions_scaled = []

        for _ in range(days_ahead):
            # Input needs shape (1, 30, 1)
            inp = current_seq.reshape(1, 30, 1)
            next_val = float(_model.predict(inp, verbose=0)[0][0])
            predictions_scaled.append(next_val)
            # Append next_val and slide the window
            current_seq = np.append(current_seq[1:], [[next_val]], axis=0)

        # 5. Inverse transform the forecasts
        pred_prices = _scaler.inverse_transform(np.array(predictions_scaled).reshape(-1, 1)).flatten()

        prices = []
        for i, val in enumerate(pred_prices):
            future_date = (datetime.now(timezone.utc) + timedelta(days=i + 1)).strftime("%Y-%m-%d")
            prices.append({"date": future_date, "price": round(float(val), 2)})

        # Determine overall trend based on final predicted price vs last historical price
        last_hist_price = float(hist_prices[-1][0])
        if prices[-1]["price"] > last_hist_price * 1.02:
            trend = "rising"
        elif prices[-1]["price"] < last_hist_price * 0.98:
            trend = "falling"
        else:
            trend = "stable"

        return {
            "crop_name": crop_name,
            "predicted_prices": prices,
            "trend": trend,
        }

    except Exception as e:
        logger.exception("Error executing LSTM forecast model. Falling back to simulation.")
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
        future_date = (datetime.now(timezone.utc) + timedelta(days=i + 1)).strftime("%Y-%m-%d")
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
