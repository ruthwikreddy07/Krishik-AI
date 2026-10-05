# Krishik AI — Architecture & Feature Pipeline Blueprint

This document defines the data-to-decision pipeline for the **Krishik AI (Telangana Crop-to-Market Platform)**. It rigorously distinguishes between:

- **ML Features** — what the model actually learns from the training dataset
- **Application-Layer Context** — location, season, farmer acreage, live weather, and configuration provided at runtime
- **Decision-Engine Inputs** — predicted yield, predicted price, distance, freight rate, combined by the application to produce an actionable recommendation

---

## 🔄 End-to-End Crop-to-Market Pipeline

This is the core sequential pipeline that connects a farmer's inputs to a best-mandi recommendation.

```
                    FARMER
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       Location       Soil       Farm Area
       (GPS/Dist)   (N,P,K,pH)   (acres)
          │            │
          ↓            ↓
       Weather APIs   Crop/Soil Data
       (Open-Meteo)   (Soil Health Card)
          │            │
          └───────┬────┘
                  ↓
        ┌────────────────────────┐
        │ 1. Crop Recommendation │
        │    Random Forest       │
        │ f(N,P,K,temp,hum,     │
        │   pH,rainfall) → crop │
        └─────────┬──────────────┘
                  ↓
          Recommended Crop
                  ↓
        ┌────────────────────────┐
        │  2. Yield Prediction   │
        │      XGBoost           │
        │ f(Year,District,       │
        │   Season,Crop,Area)    │
        │      → Yield (t/ha)   │
        └─────────┬──────────────┘
                  ↓
        Expected Yield (quintals)
        [= Yield × Acreage × 10]
                  ↓
        ┌────────────────────────┐
        │ 3. Price Forecasting   │
        │    Time Series         │
        │ f(mandi,crop,date)     │
        │   → price (₹/quintal) │
        └─────────┬──────────────┘
                  ↓
       Predicted Price ₹/quintal
                  ↓
       ┌──────────────────────────┐
       │  4. Multi-Mandi Compare  │
       │  For each candidate APMC │
       └──────────┬───────────────┘
                  ↓
        Road Distance (km)
        [farm→nearest mandi→dest]
                  ↓
        Transportation Cost (₹)
        [= dist × qty × ₹0.30]
                  ↓
       Expected Revenue (₹)
       [= price × quantity]
                  ↓
       Net Expected Return (₹)
       [= revenue − transport]
                  ↓
        🏆 Best Mandi
        [argmax(Net Return)]
```

---

## 📋 Independent Advisory Modules

These modules operate independently and are **not** forced into the crop→yield→price pipeline:

- **Disease Detection** — leaf image → disease class + management advisory
- **Fertilizer Recommendation** — soil/crop conditions → fertilizer type
- **Weather & Irrigation Advisory** — live API forecasts for farming decisions
- **Government Schemes** — informational directory
- **Gemini Agricultural Assistant** — conversational AI
- **WhatsApp Interface** — messaging access layer

---

## 📊 Module & Feature Mapping (Verified Ground Truth)

### 1. 🌱 Crop Recommendation Engine

| Layer | Details |
|---|---|
| **Dataset** | [`Crop_recommendation.csv`](file:///d:/AAProjects/Farmer%20Assisstant/ml_training/datasets/Crop_recommendation.csv) — 7,700 rows, 22 crop classes |
| **ML Features (model inputs)** | `N`, `P`, `K`, `temperature`, `humidity`, `ph`, `rainfall` |
| **ML Target** | `label` (crop name) |
| **Application-Layer Context** | `District` → agro-climatic zone verification; `Season` → Kharif/Rabi crop calendar filter. These are **not** training features; they are used as post-prediction rule-based filters to check whether the recommended crop is suitable for that location and season. |
| **Model Output** | `Recommended_Crop` |

**Verified crop classes** (22): apple, banana, blackgram, chickpea, coconut, coffee, cotton, grapes, jute, kidneybeans, lentil, maize, mango, mothbeans, mungbean, muskmelon, orange, papaya, pigeonpeas, pomegranate, rice, watermelon.

---

### 2. 🌾 Yield Prediction Engine

| Layer | Details |
|---|---|
| **Dataset** | [`Telangana_CropStats.csv`](file:///d:/AAProjects/Farmer%20Assisstant/ml_training/datasets/Telangana_CropStats.csv) — 5,591 rows, 10 districts, 65 crops, 1997–2014 |
| **ML Features (model inputs)** | `Year`, `District`, `Season`, `Crop`, `Area` |
| **ML Target** | `Yield` (tonnes/hectare) |
| **Model Output** | Predicted yield in tonnes/hectare |

> [!CAUTION]
> **Target Leakage Prevention**: The `Production` column exists in the CSV but **must NOT be used as a model input feature**. `Yield = Production / Area`, so including `Production` would leak the target. During training, drop `Production` from the feature set.

**Unit Conversion (Application Layer)**:

The model predicts yield in **tonnes/hectare**. Converting to farmer-usable quantities:

```
Step 1: Convert farmer's land area to hectares
   → If input is acres: hectares = acres × 0.4047

Step 2: Calculate expected harvest
   → Expected tonnes = Predicted Yield (t/ha) × Land Area (ha)

Step 3: Convert to quintals (for price matching)
   → Expected quintals = Expected tonnes × 10
   → (1 tonne = 10 quintals)
```

**Verified districts** (10): Adilabad, Hyderabad, Karimnagar, Khammam, Mahbubnagar, Medak, Nalgonda, Nizamabad, Rangareddi, Warangal.

**Verified seasons** (3): Kharif, Rabi, Whole Year.

---

### 3. 💰 Price Forecasting Engine

| Layer | Details |
|---|---|
| **Dataset** | [`market_prices_clean.csv`](file:///d:/AAProjects/Farmer%20Assisstant/ml_training/datasets/market_prices_clean.csv) — 571,183 rows, **273 unique mandi name strings**, 145 commodities, 2021–2026 |
| **Actual CSV Columns** | `mandi_name`, `crop_name`, `date`, `price` |
| **ML Features** | `mandi_name`, `crop_name`, `date` (engineered into year, month, day_of_week, lag prices, rolling averages) |
| **ML Target** | `price` (₹/quintal) |
| **Model Output** | Forecasted price (₹/quintal) |

> [!NOTE]
> The `price` column represents the reported wholesale price in ₹/quintal. Based on the one-price-per-mandi/crop/date structure, it is treated as the modal or single reported price. We do **not** claim it is officially the AGMARKNET modal price unless verified against the original source.

> [!IMPORTANT]
> **Mandi Count Reconciliation**: The price data contains 273 distinct mandi name strings. The MandiPulse directory has 201 rows (159 unique names — 42 are duplicates from Telangana's district reorganization). After fuzzy name matching ([`mandi_name_mapping.csv`](file:///d:/AAProjects/Farmer%20Assisstant/ml_training/datasets/mandi_name_mapping.csv)):
> - **230 price names** (86% of records / 490,943 rows) map to **125 directory mandis**
> - **43 price names** (14% of records / 80,240 rows) remain unmapped (mandis not in directory, or naming too different)
> - **34 directory mandis** have no matching price data

---

### 4. 🏪 Multi-Mandi Geospatial & Distance System

| Component | File | Verified Shape |
|---|---|---|
| **Mandi Directory** | [`Telangana_Mandis.csv`](file:///d:/AAProjects/Farmer%20Assisstant/ml_training/datasets/Telangana_Mandis.csv) | 201 rows (159 unique names), 32 districts. Columns: `District`, `MandiName` |
| **Geocoded Coordinates** | [`Mandis_GEO.csv`](file:///d:/AAProjects/Farmer%20Assisstant/ml_training/datasets/Mandis_GEO.csv) | 201 rows, 0 missing coordinates. Columns: `District`, `MandiName`, `Latitude`, `Longitude`, `GeocodingStatus` |
| **Road Distance Matrix** | [`Distances.csv`](file:///d:/AAProjects/Farmer%20Assisstant/ml_training/datasets/Distances.csv) | 40,200 directional mandi-to-mandi pairs. Columns: `From_Mandi_ID`, `From_District`, `From_Mandi`, `To_Mandi_ID`, `To_District`, `To_Mandi`, `Distance_km` |

> [!IMPORTANT]
> **Farm-to-Mandi Distance Clarification**: `Distances.csv` contains **mandi-to-mandi** road distances (computed via OSRM), **not** farm-to-mandi distances.
>
> To estimate the farmer's transport distance, the application layer uses:
>
> **Option A (Recommended)**: Identify the farmer's nearest/origin mandi (by GPS proximity), then use the precomputed mandi-to-mandi distance from `Distances.csv` for the origin→destination calculation.
>
> **Option B (Dynamic)**: Calculate farm GPS → destination mandi road distance via a live OSRM/routing API call at request time.

---

### 5. 🚚 Transportation Cost & Net Return Optimization

| Layer | Details |
|---|---|
| **Configuration** | [`transport_config.json`](file:///d:/AAProjects/Farmer%20Assisstant/ml_training/datasets/transport_config.json) |
| **Baseline Freight Parameter** | ₹0.30 per quintal-km |
| **Parameter Type** | `"rate_type": "assumption"` — baseline transportation-cost parameter used for experimental evaluation, not a universal real-world freight rate |

**Formulas**:

$$\text{Transportation Cost (₹)} = \text{Distance (km)} \times \text{Quantity (quintals)} \times ₹0.30$$

$$\text{Expected Revenue (₹)} = \text{Forecasted Price (₹/quintal)} \times \text{Quantity (quintals)}$$

$$\text{Net Return (₹)} = \text{Expected Revenue} - \text{Transportation Cost}$$

$$\textbf{Optimal Mandi} = \arg\max_{\text{Mandi } i} \left( \text{Net Return}_i \right)$$

> [!TIP]
> The ₹0.30/quintal-km baseline enables **sensitivity analysis** in the research paper — evaluating how the optimal mandi recommendation changes across a range of freight rates (e.g., ₹0.20–₹0.50).

---

### 6. 🦠 Multi-Crop Disease Detection Engine

| Layer | Details |
|---|---|
| **Dataset** | [`PlantVillage/`](file:///d:/AAProjects/Farmer%20Assisstant/ml_training/datasets/PlantVillage) — **34,526 images**, **34 classes**, 7 crops |
| **Model Input** | Leaf photo (upload or camera capture) |
| **Model Output** | `Disease_Class`, `Confidence_Score` |
| **Advisory Output** | Disease-specific management recommendation (not medically/agronomically authoritative) |

**Verified class inventory**:

| Crop | Classes | Images | Status |
|---|---|---|---|
| 🌾 Rice | Bacterial_leaf_blight (1,584), Brown_spot (1,600), Leaf_blast (1,440), Tungro (1,308), healthy (1,862) | 7,794 | ✅ Good |
| 🌿 Cotton | Alternaria_leaf_spot (173), Bacterial_blight (218), Fusarium_wilt (337), Verticillium_wilt (312), healthy (333) | 1,373 | ✅ Usable |
| 🌽 Corn/Maize | Cercospora/Gray_leaf_spot (574), Common_rust (1,306), Northern_Leaf_Blight (1,146), healthy (1,162) | 4,188 | ✅ Good |
| 🌶️ Chilli | Cercospora_leaf_spot (152), Leaf_curl (107), Nutritional_deficiency (102), Powdery_mildew (102), healthy (69) | 532 | ⚠️ Small |
| 🍅 Tomato | 10 classes (Bacterial_spot, Early/Late_blight, Leaf_Mold, Septoria, Spider_mites, Target_Spot, YellowLeaf_Curl_Virus, Mosaic_virus, healthy) | 16,012 | ✅ Excellent |
| 🥔 Potato | Early_blight (1,000), Late_blight (1,000), healthy (152) | 2,152 | ✅ Good |
| 🫑 Bell Pepper | Bacterial_spot (997), healthy (1,478) | 2,475 | ✅ Good |

**Human-in-the-Loop confidence routing**:

```
Disease Prediction
       ↓
Confidence Check
   ↙          ↘
High           Low
 ↓              ↓
Management     Expert Review
Advisory       (flagged for
               verification)
```

---

### 7. 🧪 Fertilizer Recommendation Engine

| Layer | Details |
|---|---|
| **Dataset** | [`Fertilizer_Prediction_v2.csv`](file:///d:/AAProjects/Farmer%20Assisstant/ml_training/datasets/Fertilizer_Prediction_v2.csv) — 3,500 rows |
| **Actual CSV Columns** | `Temparature`, `Humidity`, `Moisture`, `Soil Type`, `Crop Type`, `Nitrogen`, `Potassium`, `Phosphorous`, `Fertilizer Name` |
| **ML Features** | `Temparature`, `Humidity`, `Moisture`, `Soil Type`, `Crop Type`, `Nitrogen`, `Potassium`, `Phosphorous` |
| **ML Target** | `Fertilizer Name` |

> [!NOTE]
> Column order in the CSV is N, **K**, **P** (Nitrogen, Potassium, Phosphorous) — note that K comes before P, unlike the conventional N-P-K order. Also note the misspelling `Temparature` and `Phosphorous` in the original dataset headers.

**Verified unique values**:
- **Soil Types** (6): Alluvial, Black, Clay, Loamy, Red, Sandy
- **Crop Types** (7): Chickpea, Cotton, Groundnut, Maize, Pigeon Peas, Rice, Soybean
- **Fertilizer Labels** (4): 20-20, DAP, MOP, Urea

---

### 8. 🌦️ Weather Integration (Live API — Not a Training Dataset)

| Layer | Details |
|---|---|
| **Configuration** | [`weather_config.json`](file:///d:/AAProjects/Farmer%20Assisstant/ml_training/datasets/weather_config.json) |
| **Open-Meteo API** | Current temperature, relative humidity, precipitation, wind speed, 7-day forecast & rain probabilities. No API key required. CC BY 4.0 license. |
| **NASA POWER API** | Solar irradiance (MJ/m²/day), precipitation, daily temperature ranges. Agro-climatological variables. |
| **API Input** | `Latitude`, `Longitude`, `Date` |
| **Live Outputs** | Temperature, Humidity, Rainfall/Precipitation, Wind, Forecast |

> [!IMPORTANT]
> Weather is a **live external API integration**, not a machine-learning training dataset. `weather_config.json` documents the API endpoints and parameter mappings for the application layer — it is not fed to any model during training.

---

## 📦 Current Dataset and Data-Source Inventory

| # | Component | Asset | Rows / Size | Status |
|---|---|---|---|---|
| 1 | Crop Recommendation | `Crop_recommendation.csv` | 7,700 rows, 22 classes | Verified |
| 2 | Yield Prediction | `Telangana_CropStats.csv` | 5,591 rows, 10 districts, 65 crops | Verified |
| 3 | Price Forecasting | `market_prices_clean.csv` | 571,183 rows, 273 mandi names, 145 commodities | Verified |
| 4 | Mandi Directory | `Telangana_Mandis.csv` | 201 rows (159 unique), 32 districts | Verified |
| 4b | Mandi Name Mapping | `mandi_name_mapping.csv` | 273→125 mapped, 43 unmapped | Verified |
| 5 | Mandi Coordinates | `Mandis_GEO.csv` | 201 geocoded, 0 missing | Verified |
| 6 | Road Distances | `Distances.csv` | 40,200 mandi-to-mandi pairs | Verified |
| 7 | Transportation Cost | `transport_config.json` | Configured baseline parameter | Configuration |
| 8 | Disease Detection | `PlantVillage/` | 34,526 images, 34 classes, 7 crops | Verified |
| 9 | Fertilizer | `Fertilizer_Prediction_v2.csv` | 3,500 rows, 6 soils, 7 crops, 4 fertilizers | Verified |
| 10 | Weather | `weather_config.json` | Open-Meteo + NASA POWER endpoints | Live API |

> [!WARNING]
> "Verified" means the file exists, has been inspected, columns and row counts confirmed, and basic quality checks passed. It does **not** mean "ready for training" — each model's training pipeline must handle its own feature engineering, train/test splitting, class balancing, and validation.

---

## 🎯 Academic & Implementation Rigor

1. **True Feature Traceability**: Every column name and count in this document matches the actual CSV files verified on disk. No artificial or hallucinated features.
2. **Explicit Leakage Prevention**: `Production` is excluded from yield model inputs to prevent target leakage.
3. **Layered Separation**: ML models handle pattern recognition on genuine statistical features. The application layer orchestrates GIS routing, live weather, unit conversions, and economic optimization.
4. **Honest Uncertainty**: Transportation freight rate is documented as an assumption-based baseline parameter, not a universal constant. Price column semantics are documented without overclaiming the source.
5. **Reproducibility**: All datasets are localized in the workspace and independently verifiable.
