# 🔌 External API Integration Guide

This guide documents the external APIs integrated (or recommended) for the **AI-Powered Personal Farming Assistant** backend. It outlines signup links, free tier limits, and tips to obtain maximum performance with minimal cost.

---

## 1. 🌤️ Weather & Crop Advisory API

Our backend provides hyperlocal weather forecasts and translates them into actionable advisories for farmers.

### Option A: Open-Meteo API (Recommended - 100% Free)
*   **Purpose**: Weather forecasting, historical weather, soil temperature, and moisture levels.
*   **Why it's best**: Requires **NO API key**, is completely free for non-commercial use, and has a very generous limit of **10,000 calls per day**.
*   **Documentation Link**: [Open-Meteo API Documentation](https://open-meteo.com/en/docs)
*   **Integration URL**: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,rain_sum,wind_speed_10m_max&timezone=auto`

### Option B: OpenWeatherMap One Call API 3.0
*   **Purpose**: Current weather, minute forecasts, hourly/daily forecasts, and weather alerts.
*   **Free Tier**: **1,000 calls per day** for free. (Requires credit card validation to prevent abuse, but you can set a billing alert limit of 1,000 to keep it 100% free).
*   **Signup Link**: [OpenWeatherMap API Key Signup](https://home.openweathermap.org/users/sign_up)
*   **Key Activation**: Takes up to 1-2 hours after signup to activate.

---

## 2. 🌾 Real-Time Mandi Prices API

To keep farmers updated on crop rates across Telangana Mandis (Gudimalkapur, Bowenpally, Nizamabad, etc.).

### Government of India Open Data Portal (OGD)
*   **Purpose**: Fetching daily updated Agmarknet mandi commodity prices.
*   **Free Tier**: 100% Free with an API key, offering real-time JSON/XML feeds.
*   **Signup Link**: [data.gov.in Developer Sign up](https://data.gov.in/register)
*   **API Key Creation**: After logging in, go to your dashboard and generate an **API Key**.
*   **Mandi Price API Endpoint**: [Agmarknet Commodity Prices API](https://data.gov.in/resources/realtime-daily-market-prices-commodity-variety-and-grade-only-telangana-markets) (Filter specifically for Telangana).
*   **Query Format**: `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864443d0086?api-key={YOUR_API_KEY}&format=json&filters[state]=Telangana`

---

## 3. 💬 WhatsApp Advisory Alerts API

Sends automated crop health warnings, disease diagnoses, and weather warnings directly to the farmer's WhatsApp.

### Meta WhatsApp Cloud API (Official Business Platform)
*   **Purpose**: Broadcast templates, interactive messages, media uploads (images of diseased leaves).
*   **Free Tier**: Meta provides **1,000 free conversations per month** (user-initiated or business-initiated) to all developer accounts.
*   **Signup Link**: [Meta Developers Console](https://developers.facebook.com/)
*   **Setup Steps**:
    1. Register as a Meta Developer.
    2. Create a Business App.
    3. Add "WhatsApp" to your app dashboard.
    4. Link a test phone number (Meta provides a free Sandbox test number to send to up to 5 verified recipient numbers for development).
*   **Documentation Link**: [WhatsApp Cloud API Getting Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)

---

## 4. 🔑 SMS OTP Verification API

Supports secure, passwordless authentication using the farmer's mobile number.

### Option A: Firebase Auth SMS (Recommended - High Free Limit)
*   **Purpose**: Passwordless OTP login.
*   **Free Tier**: **10,000 verification SMS per month** on the Spark (Free) plan!
*   **Signup Link**: [Firebase Console](https://console.firebase.google.com/)
*   **Setup Steps**:
    1. Create a Firebase project.
    2. Enable "Phone Sign-In" in Authentication settings.
    3. Integrate Firebase Web/Android SDK on the frontend; it handles SMS delivery, reCAPTCHA verification, and credentials validation out of the box, calling our FastAPI `/api/auth/register` to sync profiles.

### Option B: Fast2SMS (Indian Gateway)
*   **Purpose**: Bulk transactional SMS & OTP.
*   **Free Tier**: Free developer registration with sign-up wallet credits (approx. 100-200 free SMS). It's extremely cheap (around 0.20 INR per SMS) for scale.
*   **Signup Link**: [Fast2SMS Registration](https://www.fast2sms.com/)
*   **Documentation Link**: [Fast2SMS API Doc](https://docs.fast2sms.com/)

---

## Summary of Config Variables (.env)

Update your `.env` in the backend with the API keys once acquired:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=farmer_assistant

# External APIs
OPENWEATHER_API_KEY=your_openweather_api_key       # Get from OpenWeatherMap
WHATSAPP_API_TOKEN=your_meta_developer_token       # Get from Meta App Dashboard
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_id    # Get from Meta App Dashboard
DATA_GOV_IN_API_KEY=your_ogd_india_api_key        # Get from data.gov.in dashboard
```
