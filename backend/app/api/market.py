"""
Market Prices API — Current mandi prices and LSTM-based price prediction.
"""
from datetime import date

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.schemas import MarketPrice
from ..ml.price_prediction import predict_price

router = APIRouter(prefix="/api/market", tags=["Market Prices"])


# ── Pydantic models ─────────────────────────────────────────

class PriceResponse(BaseModel):
    id: int
    crop_name: str
    mandi_name: str
    price: float
    price_date: date

    class Config:
        from_attributes = True


class PricePredictionResponse(BaseModel):
    crop_name: str
    predicted_prices: list[dict]  # [{"date": "2026-06-20", "price": 2500.0}, ...]
    trend: str  # "rising", "falling", "stable"


# ── Endpoints ───────────────────────────────────────────────

@router.get("/prices/{crop_name}", response_model=list[PriceResponse])
def get_market_prices(
    crop_name: str,
    mandi: str | None = Query(None, description="Filter by mandi name"),
    limit: int = Query(30, description="Number of recent price records"),
    db: Session = Depends(get_db),
):
    """Get recent market prices for a crop from mandis."""
    query = db.query(MarketPrice).filter(MarketPrice.crop_name == crop_name)
    if mandi:
        query = query.filter(MarketPrice.mandi_name == mandi)
    prices = query.order_by(MarketPrice.price_date.desc()).limit(limit).all()
    return prices


@router.get("/predict/{crop_name}", response_model=PricePredictionResponse)
def get_price_prediction(crop_name: str, days_ahead: int = Query(7, ge=1, le=30)):
    """LSTM-based market price prediction for a crop."""
    result = predict_price(crop_name=crop_name, days_ahead=days_ahead)
    return result
