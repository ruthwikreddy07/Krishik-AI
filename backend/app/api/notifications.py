"""
Notifications API — Dynamically generates smart agronomy alerts for a farmer.
Aggregates data from crops, pest risk, and weather to produce relevant notifications.
"""
import logging
from datetime import date, datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.schemas import Farmer, Crop
from .auth import get_current_farmer

logger = logging.getLogger("farmer_assistant")
router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


class NotificationItem(BaseModel):
    id: str
    type: str          # 'crop' | 'weather' | 'market' | 'disease'
    title: str
    message: str
    date: str
    unread: bool = True
    priority: str = "info"  # 'critical' | 'warning' | 'info'


@router.get("/{farmer_id}", response_model=List[NotificationItem])
def get_farmer_notifications(
    farmer_id: int,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Generate smart notifications for a farmer based on crop lifecycles and farm data."""
    if current_farmer.id != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: you can only view your own notifications"
        )

    notifications: List[NotificationItem] = []
    today = date.today()
    now_str = datetime.now().strftime("%I:%M %p")

    # ── Crop-based notifications ──────────────────────────────
    crops = db.query(Crop).filter(Crop.farmer_id == farmer_id).all()

    for crop in crops:
        if not crop.sowing_date:
            continue

        days_elapsed = (today - crop.sowing_date).days
        duration = crop.duration_days or 120
        remaining = duration - days_elapsed

        # Harvest approaching (within 14 days)
        if 0 < remaining <= 14:
            notifications.append(NotificationItem(
                id=f"harvest-{crop.id}",
                type="crop",
                title=f"Harvest Alert: {crop.crop_name}",
                message=(
                    f"Your {crop.crop_name} crop is ready for harvest in approximately "
                    f"{remaining} day{'s' if remaining != 1 else ''}. "
                    "Prepare harvesting equipment and check storage availability."
                ),
                date=f"Today, {now_str}",
                unread=True,
                priority="critical" if remaining <= 5 else "warning"
            ))

        # Mid-season fertilization reminder (40–55% of growth)
        growth_pct = (days_elapsed / duration) * 100 if duration > 0 else 0
        if 40 <= growth_pct <= 55 and crop.crop_stage in ("Vegetative", "Germination"):
            notifications.append(NotificationItem(
                id=f"fert-{crop.id}",
                type="crop",
                title=f"Fertilization Reminder: {crop.crop_name}",
                message=(
                    f"Your {crop.crop_name} is at mid-growth stage ({int(growth_pct)}% complete). "
                    "Apply the recommended split dose of Urea and Potash now for optimal yield."
                ),
                date=f"Today, {now_str}",
                unread=True,
                priority="info"
            ))

        # Overdue crop (past expected harvest, not yet marked Harvested)
        if remaining < -5 and crop.crop_stage not in ("Harvested", "Harvesting"):
            notifications.append(NotificationItem(
                id=f"overdue-{crop.id}",
                type="crop",
                title=f"Overdue Crop: {crop.crop_name}",
                message=(
                    f"{crop.crop_name} exceeded its expected harvest window by "
                    f"{abs(remaining)} days. Please update the crop stage or harvest promptly."
                ),
                date=f"Today, {now_str}",
                unread=True,
                priority="warning"
            ))

    # ── Weekly market advisory notification ───────────────────
    if today.weekday() in (0, 3):  # Monday or Thursday
        notifications.append(NotificationItem(
            id=f"market-tip-{today.isoformat()}",
            type="market",
            title="Weekly Mandi Price Advisory",
            message=(
                "Check the Market Intelligence page for updated APMC mandi prices. "
                "Our LSTM model has refreshed price forecasts for Paddy, Cotton, and Chilli this week."
            ),
            date=f"Today, {now_str}",
            unread=True,
            priority="info"
        ))

    # ── Seasonal pest risk advisory ───────────────────────────
    month = today.month
    if 6 <= month <= 9:  # Kharif season (June–September)
        notifications.append(NotificationItem(
            id=f"pest-kharif-{today.year}-{month}",
            type="disease",
            title="Kharif Season Pest Alert",
            message=(
                "High humidity during Kharif season raises risk of stem borers, "
                "leaf blast, and whitefly infestations. Visit Pest Risk Predictor for your crop-specific forecast."
            ),
            date=f"Today, {now_str}",
            unread=True,
            priority="warning"
        ))
    elif 11 <= month <= 2:  # Rabi season (Nov–Feb)
        notifications.append(NotificationItem(
            id=f"pest-rabi-{today.year}-{month}",
            type="disease",
            title="Rabi Season Advisory",
            message=(
                "Monitor fields for aphids, powdery mildew, and rust during the Rabi season. "
                "Early scouting can prevent large yield losses."
            ),
            date=f"Today, {now_str}",
            unread=True,
            priority="info"
        ))

    # Sort: critical first, then warning, then info
    priority_order = {"critical": 0, "warning": 1, "info": 2}
    notifications.sort(key=lambda n: priority_order.get(n.priority, 2))

    return notifications
