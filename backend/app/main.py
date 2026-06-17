import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import auth, crops, disease, market, schemes, weather, yield_fertilizer
from .core.database import check_db_connection, init_db

logger = logging.getLogger("farmer_assistant")


# ── Startup / Shutdown lifecycle ────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs on server startup and shutdown."""
    # Startup
    db_ok = check_db_connection()
    if db_ok:
        logger.info("✅ MySQL connection successful")
        init_db()  # Auto-create tables if they don't exist
        logger.info("✅ Database tables verified / created")
    else:
        logger.warning(
            "⚠️ MySQL is not reachable. The server will start but DB-dependent "
            "endpoints will return errors. Check your .env DB_* settings."
        )
    yield
    # Shutdown (cleanup if needed)
    logger.info("🛑 Server shutting down")


app = FastAPI(
    title="AI-Powered Personal Farming Assistant API",
    description=(
        "Backend service for Telangana Farmers smart agronomist platform. "
        "Provides crop recommendation, disease detection, yield prediction, "
        "market price forecasting, weather advisories, and government scheme lookup. "
        "Built with FastAPI, MySQL, and ML models (CNN, Random Forest, XGBoost, LSTM, Decision Tree)."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS (Cross-Origin Resource Sharing)
# This permits the frontend (React app) to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register all API routers ────────────────────────────────
app.include_router(auth.router)
app.include_router(crops.router)
app.include_router(disease.router)
app.include_router(market.router)
app.include_router(schemes.router)
app.include_router(weather.router)
app.include_router(yield_fertilizer.router)


@app.get("/")
def read_root():
    return {
        "title": "AI-Powered Personal Farming Assistant API",
        "tagline": "తెలంగాణ రైతుకు 24/7 వ్యక్తిగత AI వ్యవసాయ సహాయకుడు",
        "description": "Welcome to the API service serving Telangana farmers with localized agronomy guidance.",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    db_ok = check_db_connection()
    return {
        "status": "healthy",
        "database": "connected" if db_ok else "disconnected",
    }
