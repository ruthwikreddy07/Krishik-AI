# 🌾 Krishik AI — Transportation-Aware Farm-to-Market Decision Pipeline for Telangana

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)](https://react.dev)
[![MySQL](https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-185a9d?style=for-the-badge&logo=xgboost&logoColor=white)](https://xgboost.readthedocs.io)
[![Scikit-Learn](https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**Krishik AI (కృషిక్ AI)** is an intelligent, localized agricultural decision-support platform engineered for smallholder farmers across Telangana, India. Unlike fragmented single-task agricultural tools, Krishik AI introduces a **cascaded 4-stage machine learning and transportation-aware decision pipeline** that connects pre-sowing agronomic choices directly with post-harvest market economics and freight friction.

The platform provides dual-channel access through a modern **React 18 single-page application** and an automated **bilingual (Telugu & English) WhatsApp interface**, enabling farmers to maximize net returns, manage crop pathology, and optimize market logistics.

---

## 🚀 Cascaded Farm-to-Market Pipeline Architecture

The primary innovation of Krishik AI is its sequential 4-stage decision pipeline, linking agronomic suitability to spatial market arbitrage:

```
                    FARMER INPUTS
            (Soil NPK, pH, Location, Land Area)
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 1: Crop Recommendation (Random Forest)           │
│ Input: N, P, K, Temp, Humidity, pH, Rainfall (7 vars)  │
│ Output: Optimal Crop Variety (22 Classes)              │
│ Validation: 98.95% ± 0.42% (10-Fold Stratified CV)     │
└────────────────────────┬───────────────────────────────┘
                         │ Recommended Crop & Area
                         ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 2: Acreage-Aware Yield Estimation (XGBoost)      │
│ Input: Year, District, Season, Crop, Area (ha)         │
│ Leakage Control: Gross production isolated from inputs │
│ Output: Predicted Yield (t/ha) ➔ Harvest (Quintals)   │
│ Validation: Holdout R² = 0.9074, MAE = 0.4834 t/ha     │
└────────────────────────┬───────────────────────────────┘
                         │ Harvest Volume (Q)
                         ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 3: Temporal Price Forecasting (Stacked LSTM)     │
│ Input: Historical Mandi Prices (30-day window)         │
│ Architecture: 2-Layer LSTM (64 units, dropout = 0.20)  │
│ Output: Forecasted Wholesale Prices (₹/Quintal)        │
│ Validation: Normalized MSE < 0.0032, Dir. Acc. = 73.8% │
└────────────────────────┬───────────────────────────────┘
                         │ Forecasted Prices (P̂_m)
                         ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 4: Transportation-Aware Multi-Mandi Optimizer   │
│ Matrix: 40,200 OSRM Road Distances (201 APMC Mandis)   │
│ Formula: R_net(m) = Q × [ P̂_m - (d_m × c_f) ]         │
│ Freight Model: Break-even Transit Sensitivity Analysis │
│ Output: Ranked Mandis by Net Return (₹)                │
└────────────────────────────────────────────────────────┘
```

---

## 🌟 Comprehensive Feature Set

### 1. 🚜 4-Stage Core Farm-to-Market Pipeline
* **Random Forest Crop Selection**: Trained on 7,700 audited records across 22 crop classes using soil macronutrients ($N, P, K$), pH, and localized meteorological variables.
* **XGBoost Yield Regressor**: Trained on 5,591 Telangana crop statistics across 10 legacy districts and 65 crops (1997–2014) with strict target leakage prevention.
* **Stacked LSTM Price Predictor**: Trained on 571,183 cleaned market records across 2021–2026, predicting recursive 7-, 14-, and 30-day commodity price trajectories.
* **OSRM Multi-Mandi Optimizer**: Evaluates net realizations across all 201 geocoded Telangana APMC mandis using 40,200 precomputed road-network distances and a configurable freight-rate parameter ($c_f$).

### 2. 📸 Deep Learning Plant Pathology Scanner
* **MobileNetV2 Transfer Learning**: Classifies 34 disease classes across 7 crops (Rice, Cotton, Maize, Chilli, Tomato, Potato, Bell Pepper) trained on 34,526 leaf images.
* **Human-in-the-Loop Triage**: Low-confidence diagnostic predictions (< 70%) are automatically flagged and routed to certified agricultural officers for verification.
* **Bilingual Advisory**: Delivers immediate chemical and organic treatment protocols in both Telugu and English.

### 3. 🧪 Fertilizer & Pest Advisory
* **Random Forest Fertilizer Model**: Recommends fertilizer types (Urea, DAP, MOP, 20-20) and dosage schedules based on soil category, crop variety, and nutrient levels (76.91% CV accuracy, 77.19% macro F1).
* **Rule-Based Pest Warnings**: Identifies environmental risk windows for pest infestations based on live temperature and relative humidity triggers.

### 4. ☀️ Hyperlocal Weather & Irrigation Management
* **Open-Meteo Integration**: Live temperature, precipitation probabilities, wind speed, soil temperature, and moisture levels.
* **Smart Irrigation Scheduler**: Dynamic evapotranspiration and soil moisture thresholds provide actionable irrigate/skip advisories.

### 5. 🏛️ Government Schemes & Subsidy Explorer
* **State & Central Directory**: Complete informational guides for Rythu Bandhu, Rythu Bima, Rythu Vedika, PM-KISAN, PMFBY, and KCC.
* **Eligibility Engine**: Instant verification based on farmer age, landholding acreage, and social category.

### 6. 💬 Dual-Channel Deployment (Web & WhatsApp)
* **React 18 Single-Page Application**: Responsive dashboard featuring interactive task planners, mandi return comparison charts, and leaf photo uploads.
* **Bilingual WhatsApp Chatbot**: Integrated via Meta Cloud API and Twilio webhooks, enabling smallholders to send photos for disease diagnosis, query market rates, and receive weather alerts directly through WhatsApp.

---

## 🧠 Machine Learning Performance & Benchmarks

| Task Domain | Algorithm / Model | Training Data Volume | Evaluation Protocol | Performance Metrics |
| :--- | :--- | :--- | :--- | :--- |
| **Crop Recommendation** | **Random Forest** (Selected) | 7,700 records (22 crops) | Stratified 10-Fold CV | **98.95% ± 0.42% Accuracy** (Holdout: 99.30%) |
| **Yield Estimation** | **XGBoost Regressor** | 5,591 records (65 crops) | 80/20 Holdout & 10-Fold CV | **Holdout R²: 0.9074**, MAE: 0.4834 t/ha (CV R²: 0.9883) |
| **Price Forecasting** | **Stacked LSTM** (64 units) | 571,183 market rows | Chronological Out-of-Sample | **Norm. MSE < 0.0032**, Directional Acc: **73.8%** |
| **Foliar Pathology** | **MobileNetV2 CNN** | 34,526 images (34 classes) | Held-Out Test Set | **Top-1 Acc: 92.4%**, Top-5 Acc: **98.1%** |
| **Fertilizer Advisory** | **Random Forest v2** | 3,500 records (4 classes) | Stratified 10-Fold CV | **76.91% ± 2.08% Accuracy**, Macro F1: **77.19%** |

---

## 🚚 Transportation-Aware Freight Sensitivity Model

Krishik AI addresses the spatial price arbitrage paradox: a distant mandi offering a higher nominal price may yield a lower net realization once road transport expenses are deducted.

### Mathematical Formulation
$$\Delta R_{\text{net}} = Q \left[ (P_B - P_A) - c_f \cdot d_B \right]$$

$$d_{\max} = \frac{P_B - P_A}{c_f} = \frac{\Delta P}{c_f} \quad (\text{km})$$

where:
* $Q$: Harvest volume in quintals
* $P_A, P_B$: Wholesale prices at local and distant mandis (₹/quintal)
* $c_f$: Unit freight tariff (₹/quintal-km), baseline = ₹0.30
* $d_B$: Additional transit distance (km) from precomputed OSRM matrix

### Break-Even Distance Thresholds ($d_{\max}$ in km)
| Price Premium ($\Delta P$) | ₹0.20/q-km | ₹0.25/q-km | ₹0.30/q-km (Baseline) | ₹0.40/q-km | ₹0.50/q-km |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Rs. 50 / quintal** | 250.0 km | 200.0 km | **166.7 km** | 125.0 km | 100.0 km |
| **Rs. 80 / quintal** | 400.0 km | 320.0 km | **266.7 km** | 200.0 km | 160.0 km |
| **Rs. 100 / quintal** | 500.0 km | 400.0 km | **333.3 km** | 250.0 km | 200.0 km |
| **Rs. 150 / quintal** | 750.0 km | 600.0 km | **500.0 km** | 375.0 km | 300.0 km |

---

## 🛠️ Technology Stack & Dependencies

| Layer | Technologies & Frameworks |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Chart.js / Recharts |
| **Backend & APIs** | Python 3.11, FastAPI, Uvicorn, Pydantic, SQLAlchemy |
| **Machine Learning** | Scikit-learn, XGBoost, TensorFlow / Keras, NumPy, Pandas |
| **Database & Cache** | MySQL 8.0 (InnoDB, `utf8mb4_unicode_ci`), Redis |
| **Geospatial & Spatial** | Open Source Routing Machine (OSRM), OpenStreetMap Graph, Haversine |
| **External Integrations**| Open-Meteo API, Google Gemini API, Meta WhatsApp Cloud API, Twilio |

---

## 📁 Repository Structure

```
Farmer Assistant/
├── backend/
│   ├── app/
│   │   ├── api/             # 13 REST API endpoints (crops, diseases, markets, whatsapp, etc.)
│   │   ├── core/            # App settings, database configurations, and security
│   │   ├── ml/              # Model loaders, preprocessors, and inference pipelines
│   │   ├── models/          # SQLAlchemy ORM models & Pydantic validation schemas
│   │   ├── services/        # Weather, WhatsApp, Gemini AI, and notification services
│   │   └── main.py          # FastAPI application entry point
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components & modals
│   │   ├── pages/           # Dashboard, Disease Scanner, Market Arbitrage, Schemes, etc.
│   │   ├── services/        # Axios API client integrations
│   │   └── App.jsx          # Main client application router
│   ├── package.json         # Frontend Node dependencies
│   └── vite.config.js       # Vite build configuration
├── ml_training/
│   ├── datasets/            # Crop stats, mandi prices, OSRM distance matrices
│   ├── generate_paper_figures.py # Script for generating high-res research figures
│   ├── generate_ieee_paper_docx.py # Script for IEEE paper document formatting
│   └── run_sensitivity_analysis.py # Break-even logistics sensitivity computation
└── README.md                # Project documentation
```

---

## ⚙️ Installation & Local Setup

### Prerequisites
* **Python**: 3.10 or 3.11
* **Node.js**: v18+ & npm
* **MySQL**: 8.0+

### 1. Database Initialization
Create the database in MySQL:
```sql
CREATE DATABASE farmer_assistant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your MySQL credentials, Gemini API key, and optional Twilio/Meta tokens

# Start FastAPI development server
uvicorn app.main:app --reload
```
*API documentation will be available at `http://localhost:8000/docs`.*

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Access the web application at `http://localhost:5173`.*

---

## 🧪 Testing & Verification

```bash
# Verify Python backend compilation
python -m compileall backend/app

# Run frontend production build test
cd frontend && npm run build
```


---

## 🛡️ License

**© 2024–2026 D. Ruthwik Reddy, School of Engineering, Anurag University. All Rights Reserved.**

This repository and its contents are proprietary. No part of this codebase, datasets, models, or documentation may be reproduced or distributed without explicit authorization.
