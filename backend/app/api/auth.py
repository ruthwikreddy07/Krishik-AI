"""
Auth API — Mobile OTP-based login/registration for Telangana farmers.
No passwords; verification is via OTP sent to the farmer's mobile number.
"""
import random
import string
import logging
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from jose import jwt

from ..core.config import settings
from ..core.database import get_db
from ..models.schemas import Farmer

logger = logging.getLogger("farmer_assistant")
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

security = HTTPBearer()


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


class UpdateProfileRequest(BaseModel):
    """All fields optional — only provided fields are updated."""
    name: str | None = None
    village: str | None = None
    mandal: str | None = None
    district: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    land_size_acres: float | None = None
    soil_type: str | None = None
    water_source: str | None = None


# ── Helper utilities ────────────────────────────────────────

def _generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP."""
    return "".join(random.choices(string.digits, k=length))


def _create_access_token(farmer_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(farmer_id), "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_current_farmer(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
) -> Farmer:
    """Validate JWT token and return the authenticated farmer."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        farmer_id_str: str = payload.get("sub")
        if not farmer_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token: missing subject",
            )
        farmer_id = int(farmer_id_str)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
        )

    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Farmer profile not found",
        )
    return farmer


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
async def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    """Send OTP to the farmer's registered mobile number."""
    farmer = db.query(Farmer).filter(Farmer.mobile_number == req.mobile_number).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Mobile number not registered. Please register first.")

    otp = _generate_otp()
    farmer.otp_code = otp
    farmer.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    db.commit()

    otp_text = f"కృషిక్ AI: మీ లాగిన్ ఓటిపి (OTP): {otp}. ఇది 5 నిమిషాల వరకు మాత్రమే పనిచేస్తుంది.\n\nKrishik AI: Your verification code is {otp}. Valid for 5 minutes."
    whatsapp_success = False

    # Try Twilio WhatsApp integration first
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
        from ..services.twilio_services import send_twilio_whatsapp_message
        whatsapp_success = await send_twilio_whatsapp_message(req.mobile_number, otp_text)
    
    # Fallback to Meta WhatsApp integration
    elif settings.WHATSAPP_API_TOKEN and settings.WHATSAPP_PHONE_NUMBER_ID:
        import httpx
        formatted_num = req.mobile_number.strip()
        if not formatted_num.startswith("+"):
            if len(formatted_num) == 10:
                formatted_num = f"+91{formatted_num}"
            elif formatted_num.startswith("91") and len(formatted_num) == 12:
                formatted_num = f"+{formatted_num}"
            else:
                formatted_num = f"+91{formatted_num}"

        url = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
        headers = {
            "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
            "Content-Type": "application/json",
        }
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": formatted_num,
            "type": "text",
            "text": {
                "body": otp_text
            }
        }
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code in (200, 201):
                    logger.info(f"WhatsApp OTP sent to {formatted_num}")
                    whatsapp_success = True
                else:
                    logger.error(f"WhatsApp API failed: {resp.status_code} - {resp.text}")
        except Exception as e:
            logger.exception("Error calling WhatsApp API:")
    else:
        logger.warning("WhatsApp/Twilio API credentials missing. OTP was only saved to the database.")

    response = {"message": "OTP sent successfully"}
    if not whatsapp_success:
        response["message"] += " (Dev Mode)"
    if settings.DEBUG:
        response["otp_dev_only"] = otp
    return response


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify OTP and issue a JWT access token."""
    farmer = db.query(Farmer).filter(Farmer.mobile_number == req.mobile_number).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Mobile number not registered")

    if farmer.otp_code != req.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    if farmer.otp_expires_at and farmer.otp_expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="OTP expired. Request a new one.")

    # Mark as verified, clear OTP
    farmer.is_verified = True
    farmer.otp_code = None
    farmer.otp_expires_at = None
    db.commit()

    token = _create_access_token(farmer.id)
    return TokenResponse(access_token=token, farmer_id=farmer.id, name=farmer.name)


@router.get("/profile/{farmer_id}", response_model=FarmerProfile)
def get_profile(
    farmer_id: int,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get a farmer's profile by ID (Authenticated)."""
    if current_farmer.id != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: you can only view your own profile"
        )
    return current_farmer


@router.put("/profile/{farmer_id}", response_model=FarmerProfile)
def update_profile(
    farmer_id: int,
    req: UpdateProfileRequest,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Update an existing farmer's profile fields (Authenticated)."""
    if current_farmer.id != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: you can only update your own profile"
        )

    # Only update fields that were explicitly provided
    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(current_farmer, field, value)

    db.commit()
    db.refresh(current_farmer)
    return current_farmer


@router.post("/demo-login", response_model=TokenResponse)
def demo_login(db: Session = Depends(get_db)):
    """Authenticate or register the Demo Farmer, returning a valid JWT token."""
    demo_farmer = db.query(Farmer).filter(Farmer.mobile_number == "9999999999").first()
    if not demo_farmer:
        demo_farmer = Farmer(
            id=99999,
            name="Demo Farmer",
            mobile_number="9999999999",
            village="Warangal",
            mandal="Warangal",
            district="Warangal",
            land_size_acres=3.0,
            soil_type="Black Clayey",
            water_source="Canal",
            is_verified=True
        )
        db.add(demo_farmer)
        db.commit()
        db.refresh(demo_farmer)

    token = _create_access_token(demo_farmer.id)
    return TokenResponse(
        access_token=token,
        farmer_id=demo_farmer.id,
        name=demo_farmer.name
    )

