"""
Auth API — Mobile OTP-based login/registration for Telangana farmers.
No passwords; verification is via OTP sent to the farmer's mobile number.
"""
import random
import string
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from jose import jwt

from ..core.config import settings
from ..core.database import get_db
from ..models.schemas import Farmer

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ── Pydantic request / response models ──────────────────────

class SendOTPRequest(BaseModel):
    mobile_number: str


class VerifyOTPRequest(BaseModel):
    mobile_number: str
    otp: str


class RegisterRequest(BaseModel):
    name: str
    mobile_number: str
    village: str
    mandal: str
    district: str
    latitude: float | None = None
    longitude: float | None = None
    land_size_acres: float
    soil_type: str
    water_source: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    farmer_id: int
    name: str


class FarmerProfile(BaseModel):
    id: int
    name: str
    mobile_number: str
    village: str
    mandal: str
    district: str
    latitude: float | None
    longitude: float | None
    land_size_acres: float
    soil_type: str
    water_source: str
    is_verified: bool

    class Config:
        from_attributes = True


# ── Helper utilities ────────────────────────────────────────

def _generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP."""
    return "".join(random.choices(string.digits, k=length))


def _create_access_token(farmer_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(farmer_id), "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# ── Endpoints ───────────────────────────────────────────────

@router.post("/register", response_model=FarmerProfile, status_code=status.HTTP_201_CREATED)
def register_farmer(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new farmer profile (Step 1 — before OTP verification)."""
    existing = db.query(Farmer).filter(Farmer.mobile_number == req.mobile_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mobile number already registered")

    farmer = Farmer(
        name=req.name,
        mobile_number=req.mobile_number,
        village=req.village,
        mandal=req.mandal,
        district=req.district,
        latitude=req.latitude,
        longitude=req.longitude,
        land_size_acres=req.land_size_acres,
        soil_type=req.soil_type,
        water_source=req.water_source,
    )
    db.add(farmer)
    db.commit()
    db.refresh(farmer)
    return farmer


@router.post("/send-otp")
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    """Send OTP to the farmer's registered mobile number."""
    farmer = db.query(Farmer).filter(Farmer.mobile_number == req.mobile_number).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Mobile number not registered. Please register first.")

    otp = _generate_otp()
    farmer.otp_code = otp
    farmer.otp_expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    db.commit()

    # TODO: Integrate actual SMS / WhatsApp delivery here
    # For development, return OTP in response (remove in production!)
    return {"message": "OTP sent successfully", "otp_dev_only": otp}


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify OTP and issue a JWT access token."""
    farmer = db.query(Farmer).filter(Farmer.mobile_number == req.mobile_number).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Mobile number not registered")

    if farmer.otp_code != req.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    if farmer.otp_expires_at and farmer.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="OTP expired. Request a new one.")

    # Mark as verified, clear OTP
    farmer.is_verified = True
    farmer.otp_code = None
    farmer.otp_expires_at = None
    db.commit()

    token = _create_access_token(farmer.id)
    return TokenResponse(access_token=token, farmer_id=farmer.id, name=farmer.name)


@router.get("/profile/{farmer_id}", response_model=FarmerProfile)
def get_profile(farmer_id: int, db: Session = Depends(get_db)):
    """Get a farmer's profile by ID."""
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer
