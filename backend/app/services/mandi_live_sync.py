"""
Live Mandi Price Ingestion Service.
Fetches real-time commodity prices from the official Ministry of Agriculture
data.gov.in (Agmarknet) API and synchronizes them into the database.
"""
import logging
from datetime import datetime, date
import requests
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.database import SessionLocal
from ..models.schemas import MarketPrice

logger = logging.getLogger("farmer_assistant")

AGMARKNET_RESOURCE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

# Standard headers to prevent government firewall throttling
DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
}

# Mapping common Agmarknet commodity strings to standard project crop names
CROP_NAME_STANDARDIZATION = {
    "paddy(common)": "Paddy (Dhan)(Common)",
    "paddy (dhan)(common)": "Paddy (Dhan)(Common)",
    "rice": "Rice",
    "cotton": "Cotton",
    "maize": "Maize",
    "groundnut": "Groundnut",
    "bengal gram(gram)(whole)": "Chickpea",
    "red gram": "Pigeon Peas",
    "arhar (tur/red gram)(whole)": "Pigeon Peas",
    "tomato": "Tomato",
    "onion": "Onion",
    "potato": "Potato",
    "chilli red": "Chilli",
    "green chilli": "Chilli",
}


def fetch_live_mandi_data(state: str = "Telangana", limit: int = 500) -> list[dict]:
    """
    Fetch current mandi prices from data.gov.in API.
    """
    api_key = settings.DATA_GOV_IN_API_KEY
    if not api_key:
        logger.warning("DATA_GOV_IN_API_KEY is not configured in settings.")
        return []

    params = {
        "api-key": api_key,
        "format": "json",
        "filters[state.keyword]": state,
        "limit": str(limit),
    }

    try:
        logger.info(f"Fetching live mandi prices from data.gov.in for state: {state}")
        resp = requests.get(
            AGMARKNET_RESOURCE_URL,
            params=params,
            headers=DEFAULT_HEADERS,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()

        if data.get("status") != "ok":
            logger.warning(f"data.gov.in returned non-ok status: {data.get('message')}")
            return []

        records = data.get("records", [])
        logger.info(f"Successfully retrieved {len(records)} live records from data.gov.in")
        return records
    except requests.exceptions.Timeout:
        logger.error("data.gov.in API request timed out.")
        return []
    except Exception as e:
        logger.exception(f"Failed to fetch live mandi prices from data.gov.in: {e}")
        return []


def parse_arrival_date(date_str: str) -> date:
    """Parse arrival date string from various formats (DD/MM/YYYY, YYYY-MM-DD)."""
    date_str = str(date_str).strip()
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            pass
    return date.today()


def sync_live_mandi_prices(state: str = "Telangana", limit: int = 500, db: Session | None = None) -> dict:
    """
    Fetch live data from Agmarknet, filter duplicates, and persist new records to the database.

    Returns:
        dict: Summary of sync operation including records_fetched, new_records_added.
    """
    records = fetch_live_mandi_data(state=state, limit=limit)
    if not records:
        return {
            "status": "warning",
            "message": "No live records retrieved (API timeout or empty response)",
            "records_fetched": 0,
            "new_records_added": 0,
            "timestamp": datetime.now().isoformat(),
        }

    close_db_after = False
    if db is None:
        db = SessionLocal()
        close_db_after = True

    try:
        new_count = 0
        for rec in records:
            raw_commodity = rec.get("commodity")
            market = rec.get("market")
            modal_price = rec.get("modal_price")
            raw_date = rec.get("arrival_date")

            if not raw_commodity or not market or modal_price is None:
                continue

            try:
                price_val = float(modal_price)
            except (ValueError, TypeError):
                continue

            # Standardize crop name if matching mapping exists
            commodity = CROP_NAME_STANDARDIZATION.get(raw_commodity.strip().lower(), raw_commodity.strip())
            mandi_clean = market.strip()
            price_date = parse_arrival_date(raw_date)

            # Avoid duplicates: check if this crop, mandi, and date already exists
            existing = (
                db.query(MarketPrice.id)
                .filter(
                    MarketPrice.crop_name == commodity,
                    MarketPrice.mandi_name == mandi_clean,
                    MarketPrice.price_date == price_date,
                )
                .first()
            )

            if not existing:
                new_entry = MarketPrice(
                    crop_name=commodity,
                    mandi_name=mandi_clean,
                    price=price_val,
                    price_date=price_date,
                )
                db.add(new_entry)
                new_count += 1

        db.commit()
        logger.info(f"Live mandi sync completed. Added {new_count} new records.")

        return {
            "status": "success",
            "state": state,
            "records_fetched": len(records),
            "new_records_added": new_count,
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        db.rollback()
        logger.exception(f"Error persisting live mandi records: {e}")
        return {
            "status": "error",
            "message": str(e),
            "records_fetched": len(records),
            "new_records_added": 0,
            "timestamp": datetime.now().isoformat(),
        }
    finally:
        if close_db_after:
            db.close()
