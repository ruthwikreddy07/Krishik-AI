import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "AI-Powered Personal Farming Assistant"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database (MySQL)
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "farmer_assistant")

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    # JWT / OTP Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-this-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    OTP_EXPIRE_MINUTES: int = 5

    # External APIs (Weather uses Open-Meteo — no key needed)
    WHATSAPP_API_TOKEN: str = os.getenv("WHATSAPP_API_TOKEN", "")
    WHATSAPP_PHONE_NUMBER_ID: str = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
    DATA_GOV_IN_API_KEY: str = os.getenv("DATA_GOV_IN_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Twilio Configuration
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_WHATSAPP_NUMBER: str = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

    # Firebase (used by frontend; stored here for reference)
    FIREBASE_API_KEY: str = os.getenv("FIREBASE_API_KEY", "")
    FIREBASE_AUTH_DOMAIN: str = os.getenv("FIREBASE_AUTH_DOMAIN", "")
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    FIREBASE_STORAGE_BUCKET: str = os.getenv("FIREBASE_STORAGE_BUCKET", "")
    FIREBASE_MESSAGING_SENDER_ID: str = os.getenv("FIREBASE_MESSAGING_SENDER_ID", "")
    FIREBASE_APP_ID: str = os.getenv("FIREBASE_APP_ID", "")

    # ML Model Paths
    DISEASE_MODEL_PATH: str = os.getenv("DISEASE_MODEL_PATH", "ml_models/disease_model.keras")
    CROP_RECOMMEND_MODEL_PATH: str = os.getenv("CROP_RECOMMEND_MODEL_PATH", "ml_models/crop_recommendation.pkl")
    YIELD_MODEL_PATH: str = os.getenv("YIELD_MODEL_PATH", "ml_models/yield_prediction.pkl")
    PRICE_MODEL_PATH: str = os.getenv("PRICE_MODEL_PATH", "ml_models/price_prediction.h5")
    FERTILIZER_MODEL_PATH: str = os.getenv("FERTILIZER_MODEL_PATH", "ml_models/fertilizer_recommendation.pkl")

    # File Upload
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads/disease_images")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
