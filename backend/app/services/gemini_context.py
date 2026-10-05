"""
Gemini Context Builder — Builds compact, structured farmer context for the AI assistant.

Pulls data from multiple sources and formats it into ~800 tokens of structured text
that gets injected into the Gemini system prompt for personalized responses.
"""
import logging
from datetime import datetime
from typing import Optional

import httpx
from sqlalchemy import desc
from sqlalchemy.orm import Session

from ..models.schemas import Farmer, Crop, DiseaseRecord, MLPrediction, ChatHistory

logger = logging.getLogger("farmer_assistant")


async def fetch_live_weather(latitude: float, longitude: float) -> Optional[str]:
    """Fetch current weather from Open-Meteo API for the farmer's location."""
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={latitude}&longitude={longitude}"
            f"&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m"
            f"&daily=precipitation_sum,temperature_2m_max,temperature_2m_min"
            f"&timezone=Asia/Kolkata&forecast_days=2"
        )
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                daily = data.get("daily", {})

                temp = current.get("temperature_2m", "N/A")
                humidity = current.get("relative_humidity_2m", "N/A")
                precip = current.get("precipitation", 0)
                wind = current.get("wind_speed_10m", "N/A")

                # Tomorrow's forecast
                tomorrow_rain = "N/A"
                tomorrow_max = "N/A"
                if daily and daily.get("precipitation_sum") and len(daily["precipitation_sum"]) > 1:
                    tomorrow_rain = f"{daily['precipitation_sum'][1]}mm"
                    tomorrow_max = f"{daily['temperature_2m_max'][1]}°C"

                weather_str = (
                    f"Weather Now: {temp}°C, {humidity}% humidity, "
                    f"Wind: {wind} km/h, Precip: {precip}mm\n"
                    f"Tomorrow: Max {tomorrow_max}, Rain: {tomorrow_rain}"
                )
                return weather_str
    except Exception as e:
        logger.warning(f"Failed to fetch weather for ({latitude}, {longitude}): {e}")
    return None


def build_farmer_context(
    farmer: Farmer,
    session_id: Optional[str],
    db: Session,
) -> str:
    """
    Build a compact context block (~800 tokens) for the Gemini prompt.

    Includes:
    1. Farmer profile (name, location, soil, farm area)
    2. Current crop + growth stage
    3. Latest ML prediction of each type
    4. Latest disease detection
    5. Recent chat messages from current session

    Weather is fetched separately (async) and appended by the caller.
    """
    lines = []

    # ── 1. Farmer Profile ──────────────────────────────────────
    location_parts = [farmer.village, farmer.mandal, farmer.district]
    location_str = ", ".join(p for p in location_parts if p)

    coords = ""
    if farmer.latitude and farmer.longitude:
        coords = f" ({float(farmer.latitude):.2f}, {float(farmer.longitude):.2f})"

    lines.append(f"Farmer: {farmer.name}, {location_str}, Telangana{coords}")

    soil_parts = [f"{farmer.soil_type}"]
    if farmer.soil_ph is not None:
        soil_parts.append(f"pH {float(farmer.soil_ph)}")
    if farmer.soil_n is not None:
        soil_parts.append(f"N:{float(farmer.soil_n)}")
    if farmer.soil_p is not None:
        soil_parts.append(f"P:{float(farmer.soil_p)}")
    if farmer.soil_k is not None:
        soil_parts.append(f"K:{float(farmer.soil_k)}")
    lines.append(f"Soil: {', '.join(soil_parts)}")

    farm_info = f"Farm: {float(farmer.land_size_acres)} acres, {farmer.water_source}"
    if farmer.season:
        farm_info += f", Season: {farmer.season}"
    lines.append(farm_info)

    # ── 2. Current Crop + Stage ────────────────────────────────
    latest_crop = (
        db.query(Crop)
        .filter(Crop.farmer_id == farmer.id)
        .order_by(desc(Crop.created_at))
        .first()
    )
    if latest_crop:
        crop_line = f"Current Crop: {latest_crop.crop_name}, Stage: {latest_crop.crop_stage}"
        if latest_crop.sowing_date:
            crop_line += f", Sowed: {latest_crop.sowing_date.strftime('%b %d')}"
        lines.append(crop_line)

    # ── 3. Latest ML Predictions (one per type) ────────────────
    prediction_types = ['crop', 'yield', 'price', 'fertilizer', 'mandi']
    predictions_found = []
    for ptype in prediction_types:
        pred = (
            db.query(MLPrediction)
            .filter(
                MLPrediction.farmer_id == farmer.id,
                MLPrediction.prediction_type == ptype,
            )
            .order_by(desc(MLPrediction.created_at))
            .first()
        )
        if pred:
            predictions_found.append(f"- {ptype.title()}: {pred.result_summary}")

    if predictions_found:
        lines.append("")
        lines.append("Latest Predictions:")
        lines.extend(predictions_found)

    # ── 4. Latest Disease Detection ────────────────────────────
    latest_disease = (
        db.query(DiseaseRecord)
        .filter(DiseaseRecord.farmer_id == farmer.id)
        .order_by(desc(DiseaseRecord.created_at))
        .first()
    )
    if latest_disease:
        disease_line = f"Disease: {latest_disease.detected_disease} ({float(latest_disease.confidence):.0f}% confidence"
        if latest_disease.verified_by_expert:
            disease_line += ", expert confirmed"
        disease_line += f", {latest_disease.created_at.strftime('%b %d')})"
        lines.append(disease_line)

    # ── 5. Recent Chat (current session) ───────────────────────
    if session_id:
        recent_msgs = (
            db.query(ChatHistory)
            .filter(
                ChatHistory.farmer_id == farmer.id,
                ChatHistory.session_id == session_id,
            )
            .order_by(ChatHistory.created_at.asc())
            .limit(30)  # safety cap per session
            .all()
        )
        # Don't include in context text — these go into the Gemini contents array
        # But note the count for the system prompt
        if recent_msgs:
            lines.append(f"\n(This conversation has {len(recent_msgs)} previous messages)")

    return "\n".join(lines)


def get_session_chat_history(
    farmer_id: int,
    session_id: str,
    db: Session,
) -> list[dict]:
    """
    Retrieve all chat messages for a specific session to include in Gemini contents.
    Returns a list of dicts with 'role' and 'text' keys.
    """
    messages = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.farmer_id == farmer_id,
            ChatHistory.session_id == session_id,
        )
        .order_by(ChatHistory.created_at.asc())
        .limit(30)  # safety cap
        .all()
    )

    history = []
    for msg in messages:
        role = "user" if msg.sender == "user" else "model"
        history.append({"role": role, "text": msg.message})

    return history
