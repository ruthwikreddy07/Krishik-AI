from datetime import datetime
from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, Date, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Farmer(Base):
    __tablename__ = 'farmers'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    mobile_number = Column(String(15), unique=True, nullable=False, index=True)
    village = Column(String(100), nullable=False)
    mandal = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    latitude = Column(Numeric(9, 6), nullable=True)
    longitude = Column(Numeric(9, 6), nullable=True)
    land_size_acres = Column(Numeric(5, 2), nullable=False)
    soil_type = Column(String(50), nullable=False)
    water_source = Column(String(50), nullable=False)
    is_verified = Column(Boolean, default=False)
    otp_code = Column(String(100), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    crops = relationship("Crop", back_populates="farmer", cascade="all, delete-orphan")
    disease_records = relationship("DiseaseRecord", back_populates="farmer", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="farmer", cascade="all, delete-orphan")
    activities = relationship("UserActivity", back_populates="farmer", cascade="all, delete-orphan")


class Crop(Base):
    __tablename__ = 'crops'

    id = Column(Integer, primary_key=True, autoincrement=True)
    farmer_id = Column(Integer, ForeignKey('farmers.id', ondelete='CASCADE'), nullable=False, index=True)
    crop_name = Column(String(100), nullable=False)
    sowing_date = Column(Date, nullable=False)
    crop_stage = Column(String(50), nullable=False, default='Sowing')
    duration_days = Column(Integer, nullable=False, default=120)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer", back_populates="crops")
    disease_records = relationship("DiseaseRecord", back_populates="crop")


class DiseaseRecord(Base):
    __tablename__ = 'disease_records'

    id = Column(Integer, primary_key=True, autoincrement=True)
    farmer_id = Column(Integer, ForeignKey('farmers.id', ondelete='CASCADE'), nullable=False, index=True)
    crop_id = Column(Integer, ForeignKey('crops.id', ondelete='SET NULL'), nullable=True, index=True)
    image_url = Column(String(255), nullable=False)
    detected_disease = Column(String(150), nullable=False)
    confidence = Column(Numeric(5, 2), nullable=False)
    treatment_recommendation = Column(Text, nullable=False)
    verified_by_expert = Column(Boolean, default=False)
    expert_comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer", back_populates="disease_records")
    crop = relationship("Crop", back_populates="disease_records")


class MarketPrice(Base):
    __tablename__ = 'market_prices'

    id = Column(Integer, primary_key=True, autoincrement=True)
    crop_name = Column(String(100), nullable=False)
    mandi_name = Column(String(100), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    price_date = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class GovernmentScheme(Base):
    __tablename__ = 'government_schemes'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    eligibility_criteria = Column(Text, nullable=False)
    benefits = Column(Text, nullable=False)
    scheme_type = Column(String(50), nullable=False, default='State')  # State or Central
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = 'notifications'

    id = Column(Integer, primary_key=True, autoincrement=True)
    farmer_id = Column(Integer, ForeignKey('farmers.id', ondelete='CASCADE'), nullable=False, index=True)
    alert_type = Column(String(50), nullable=False)  # Weather, Market, Disease, Reminder, Scheme
    message = Column(Text, nullable=False)
    sent_via = Column(String(20), nullable=False, default='WhatsApp')  # WhatsApp or Web
    status = Column(String(20), nullable=False, default='Pending')  # Pending, Sent, Failed
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer", back_populates="notifications")


class UserActivity(Base):
    __tablename__ = 'user_activity'

    id = Column(Integer, primary_key=True, autoincrement=True)
    farmer_id = Column(Integer, ForeignKey('farmers.id', ondelete='SET NULL'), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    channel = Column(String(20), nullable=False)  # WhatsApp or Web
    request_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer", back_populates="activities")


class Staff(Base):
    __tablename__ = 'staff'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # 'admin' or 'expert'
    created_at = Column(DateTime, default=datetime.utcnow)

