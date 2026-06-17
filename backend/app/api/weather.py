"""
Weather API — Hyperlocal weather data using farmer's GPS coordinates.
Uses the free Open-Meteo API (no API key required).
Returns temperature, rainfall, rain probability, wind speed, humidity,
soil temperature, and soil moisture — all useful for farming advisories.
"""
import httpx
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.schemas import Farmer
from .auth import get_current_farmer

router = APIRouter(prefix="/api/weather", tags=["Weather"])

# ── Open-Meteo base URL (free, no key needed) ──────────────
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


# ── Pydantic response models ───────────────────────────────

class WeatherCurrent(BaseModel):
    temperature: float          # °C
    humidity: float             # %
    wind_speed: float           # km/h
    soil_temperature: float     # °C (surface 0 cm)
    soil_moisture: float        # m³/m³ (0–1 cm depth)
    description: str            # Human-readable summary
    rain_mm: float | None = None


class WeatherForecastDay(BaseModel):
    date: str                           # YYYY-MM-DD
    temp_min: float                     # °C
    temp_max: float                     # °C
    rain_sum: float                     # mm
    rain_probability: float             # 0–100 %
    wind_speed_max: float               # km/h
    avg_humidity: float                 # % (daily average from hourly)
    avg_soil_temperature: float         # °C (daily average from hourly)
    avg_soil_moisture: float            # m³/m³ (daily average from hourly)


class WeatherResponse(BaseModel):
    farmer_id: int
    location: str                       # "Mandal, District"
    current: WeatherCurrent
    forecast: list[WeatherForecastDay]  # 7-day forecast
    irrigation_advisory: str
    crop_advisory: str


# ── Helper: generate human-readable description ────────────

def _weather_description(temp: float, humidity: float, rain_mm: float | None) -> str:
    """Build a simple weather description from numeric values."""
    parts = []
    if rain_mm and rain_mm > 5:
        parts.append("Rainy")
    elif rain_mm and rain_mm > 0:
        parts.append("Light Rain")
    elif humidity > 80:
        parts.append("Overcast / Humid")
    elif temp > 38:
        parts.append("Hot & Clear")
    elif temp > 30:
        parts.append("Warm & Partly Cloudy")
    else:
        parts.append("Pleasant")
    return ", ".join(parts)


# ── Helper: irrigation & crop advisories ───────────────────

def _generate_advisories(
    forecast_days: list[WeatherForecastDay],
    current_soil_moisture: float,
) -> tuple[str, str]:
    """Generate irrigation and crop advisory strings."""

    # Irrigation advisory
    rain_in_2_days = any(d.rain_probability > 50 for d in forecast_days[:2])
    soil_dry = current_soil_moisture < 0.15  # threshold for dry soil

    if rain_in_2_days:
        irrigation = (
            "🌧️ వర్షం ఆశించబడుతోంది — నీటిపారుదల అవసరం లేదు.\n"
            "(Rain expected in next 2 days — skip irrigation to save water.)"
        )
    elif soil_dry:
        irrigation = (
            "🚰 నేల తేమ తక్కువగా ఉంది — వెంటనే నీటిపారుదల చేయండి.\n"
            "(Soil moisture is low — irrigate immediately.)"
        )
    else:
        irrigation = (
            "✅ నేల తేమ సరిపోతుంది — ప్రస్తుతానికి నీటిపారుదల అవసరం లేదు.\n"
            "(Soil moisture is adequate — no irrigation needed now.)"
        )

    # Crop advisory based on temperature and wind
    crop_parts = []
    high_temp_days = [d for d in forecast_days[:3] if d.temp_max > 40]
    high_wind_days = [d for d in forecast_days[:3] if d.wind_speed_max > 40]
    heavy_rain_days = [d for d in forecast_days[:3] if d.rain_sum > 30]

    if high_temp_days:
        crop_parts.append(
            "🌡️ Heat alert: Apply mulch to protect roots and water in the evening."
        )
    if high_wind_days:
        crop_parts.append(
            "💨 Strong winds expected: Secure stakes and protect young saplings."
        )
    if heavy_rain_days:
        crop_parts.append(
            "⛈️ Heavy rain alert: Ensure proper drainage to prevent waterlogging."
        )
    if not crop_parts:
        crop_parts.append(
            "☀️ Weather conditions are favorable for regular farming operations."
        )

    return irrigation, "\n".join(crop_parts)


# ── Helper: average hourly values per day ──────────────────

def _daily_averages_from_hourly(
    hourly_times: list[str],
    hourly_humidity: list[float],
    hourly_soil_temp: list[float],
    hourly_soil_moisture: list[float],
) -> dict[str, dict]:
    """Group hourly values by date and compute daily averages."""
    buckets: dict[str, dict] = {}
    for i, ts in enumerate(hourly_times):
        date_str = ts[:10]  # "YYYY-MM-DD"
        if date_str not in buckets:
            buckets[date_str] = {"humidity": [], "soil_temp": [], "soil_moisture": []}
        buckets[date_str]["humidity"].append(hourly_humidity[i])
        buckets[date_str]["soil_temp"].append(hourly_soil_temp[i])
        buckets[date_str]["soil_moisture"].append(hourly_soil_moisture[i])

    averages = {}
    for date_str, vals in buckets.items():
        averages[date_str] = {
            "humidity": sum(vals["humidity"]) / len(vals["humidity"]),
            "soil_temp": sum(vals["soil_temp"]) / len(vals["soil_temp"]),
            "soil_moisture": sum(vals["soil_moisture"]) / len(vals["soil_moisture"]),
        }
    return averages


# ── Standalone endpoint (no DB, just lat/lon) ──────────────
# IMPORTANT: This route MUST be declared before /{farmer_id} to prevent
# FastAPI from trying to parse "by-location" as an integer farmer_id.

@router.get("/by-location/", response_model=dict)
async def get_weather_by_location(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    """
    Get weather without needing a farmer_id — useful for the frontend
    before a farmer's profile is fully set up. Pass lat/lon as query params.
    Example: /api/weather/by-location/?lat=17.385&lon=78.4867
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "temperature_2m_max,temperature_2m_min,rain_sum,precipitation_probability_max,wind_speed_10m_max",
        "hourly": "relative_humidity_2m,soil_temperature_0cm,soil_moisture_0_to_1cm",
        "timezone": "auto",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(OPEN_METEO_URL, params=params)

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch weather data from Open-Meteo")

    data = resp.json()
    daily = data.get("daily", {})
    hourly = data.get("hourly", {})

    # Compute daily averages
    hourly_avgs = _daily_averages_from_hourly(
        hourly_times=hourly.get("time", []),
        hourly_humidity=hourly.get("relative_humidity_2m", []),
        hourly_soil_temp=hourly.get("soil_temperature_0cm", []),
        hourly_soil_moisture=hourly.get("soil_moisture_0_to_1cm", []),
    )

    dates = daily.get("time", [])
    forecast = []
    for i, date_str in enumerate(dates):
        avg = hourly_avgs.get(date_str, {"humidity": 0, "soil_temp": 0, "soil_moisture": 0})
        forecast.append({
            "date": date_str,
            "temp_min": daily["temperature_2m_min"][i],
            "temp_max": daily["temperature_2m_max"][i],
            "rain_sum_mm": daily.get("rain_sum", [0])[i],
            "rain_probability_pct": daily.get("precipitation_probability_max", [0])[i],
            "wind_speed_max_kmh": daily.get("wind_speed_10m_max", [0])[i],
            "avg_humidity_pct": round(avg["humidity"], 1),
            "avg_soil_temp_c": round(avg["soil_temp"], 1),
            "avg_soil_moisture_m3m3": round(avg["soil_moisture"], 4),
        })

    return {
        "latitude": lat,
        "longitude": lon,
        "timezone": data.get("timezone", "auto"),
        "forecast_days": forecast,
    }


# ── Main endpoint (farmer GPS-based) ───────────────────────

@router.get("/{farmer_id}", response_model=WeatherResponse)
async def get_weather(
    farmer_id: int,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """
    Get hyperlocal weather data for a farmer based on their registered GPS coordinates.
    Includes current conditions, 7-day forecast, irrigation advisory, and crop advisory.
    Data sourced from the Open-Meteo API (free, no key required).
    """
    if current_farmer.id != farmer_id:
        raise HTTPException(
            status_code=403,
            detail="Access forbidden: you can only view weather for your own coordinates"
        )

    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    if not farmer.latitude or not farmer.longitude:
        raise HTTPException(
            status_code=400,
            detail="GPS coordinates not set. Please update your profile with latitude/longitude.",
        )

    lat, lon = float(farmer.latitude), float(farmer.longitude)

    # ── Call Open-Meteo API ─────────────────────────────────
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "temperature_2m_max,temperature_2m_min,rain_sum,precipitation_probability_max,wind_speed_10m_max",
        "hourly": "relative_humidity_2m,soil_temperature_0cm,soil_moisture_0_to_1cm",
        "timezone": "auto",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(OPEN_METEO_URL, params=params)

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch weather data from Open-Meteo")

    data = resp.json()
    daily = data.get("daily", {})
    hourly = data.get("hourly", {})

    # ── Compute daily averages from hourly data ─────────────
    hourly_avgs = _daily_averages_from_hourly(
        hourly_times=hourly.get("time", []),
        hourly_humidity=hourly.get("relative_humidity_2m", []),
        hourly_soil_temp=hourly.get("soil_temperature_0cm", []),
        hourly_soil_moisture=hourly.get("soil_moisture_0_to_1cm", []),
    )

    # ── Build current weather (use first hourly values) ─────
    now_hour = datetime.now().hour
    # Clamp to available index (Open-Meteo returns 168 hourly values for 7 days)
    idx = min(now_hour, len(hourly.get("relative_humidity_2m", [])) - 1)
    idx = max(idx, 0)

    current_humidity = hourly.get("relative_humidity_2m", [0])[idx]
    current_soil_temp = hourly.get("soil_temperature_0cm", [0])[idx]
    current_soil_moisture = hourly.get("soil_moisture_0_to_1cm", [0])[idx]

    # Current temp = average of today's min/max (Open-Meteo doesn't give "current" in forecast mode)
    today_tmax = daily.get("temperature_2m_max", [30])[0]
    today_tmin = daily.get("temperature_2m_min", [20])[0]
    current_temp = round((today_tmax + today_tmin) / 2, 1)
    today_rain = daily.get("rain_sum", [0])[0]

    current = WeatherCurrent(
        temperature=current_temp,
        humidity=current_humidity,
        wind_speed=daily.get("wind_speed_10m_max", [0])[0],
        soil_temperature=current_soil_temp,
        soil_moisture=current_soil_moisture,
        rain_mm=today_rain if today_rain > 0 else None,
        description=_weather_description(current_temp, current_humidity, today_rain),
    )

    # ── Build 7-day forecast ────────────────────────────────
    dates = daily.get("time", [])
    forecast_days = []
    for i, date_str in enumerate(dates):
        avg = hourly_avgs.get(date_str, {"humidity": 0, "soil_temp": 0, "soil_moisture": 0})
        forecast_days.append(
            WeatherForecastDay(
                date=date_str,
                temp_min=daily["temperature_2m_min"][i],
                temp_max=daily["temperature_2m_max"][i],
                rain_sum=daily.get("rain_sum", [0])[i],
                rain_probability=daily.get("precipitation_probability_max", [0])[i],
                wind_speed_max=daily.get("wind_speed_10m_max", [0])[i],
                avg_humidity=round(avg["humidity"], 1),
                avg_soil_temperature=round(avg["soil_temp"], 1),
                avg_soil_moisture=round(avg["soil_moisture"], 4),
            )
        )

    # ── Generate advisories ─────────────────────────────────
    irrigation_advisory, crop_advisory = _generate_advisories(
        forecast_days, current_soil_moisture
    )

    return WeatherResponse(
        farmer_id=farmer_id,
        location=f"{farmer.mandal}, {farmer.district}",
        current=current,
        forecast=forecast_days,
        irrigation_advisory=irrigation_advisory,
        crop_advisory=crop_advisory,
    )

