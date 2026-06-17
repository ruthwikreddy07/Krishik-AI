import os
import pickle
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from xgboost import XGBRegressor

os.makedirs("ml_models", exist_ok=True)
datasets_dir = "ml_training/datasets"

# ==========================================
# 1. CROP RECOMMENDATION MODEL
# ==========================================
print("\n" + "="*50)
print("Training Crop Recommendation Model...")
print("="*50)
try:
    df_crop = pd.read_csv(os.path.join(datasets_dir, "Crop_recommendation.csv"))
    X = df_crop[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']].values
    y = df_crop['label'].values
    
    # Encode target labels
    le_crop = LabelEncoder()
    y_encoded = le_crop.fit_transform(y)
    
    # Train Random Forest Classifier
    rf_model = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1)
    rf_model.fit(X, y_encoded)
    
    # Save model
    with open("ml_models/crop_recommendation.pkl", "wb") as f:
        pickle.dump(rf_model, f)
    with open("ml_models/crop_label_encoder.pkl", "wb") as f:
        pickle.dump(le_crop, f)
    
    print("[OK] Crop Recommendation model trained and saved successfully!")
except Exception as e:
    print(f"[FAIL] Crop Recommendation failed: {e}")


# ==========================================
# 2. FERTILIZER RECOMMENDATION MODEL
# ==========================================
print("\n" + "="*50)
print("Training Fertilizer Recommendation Model...")
print("="*50)
try:
    df_fert = pd.read_csv(os.path.join(datasets_dir, "Fertilizer_Prediction.csv"))
    
    # Add simulated crop stage column since it's expected by the backend
    np.random.seed(42)
    stages = ["Sowing", "Vegetative", "Flowering", "Harvesting"]
    df_fert['Stage'] = np.random.choice(stages, size=len(df_fert))
    
    # Map features to match backend:
    # crop_map = {"Rice": 0, "Maize": 1, "Cotton": 2, "Chickpea": 3, "Pigeon Peas": 4, "Groundnut": 5}
    crop_map_dataset = {
        'Paddy': 0, 'Rice': 0, 'Maize': 1, 'Cotton': 2, 'Chickpea': 3, 
        'Pigeon Peas': 4, 'Groundnut': 5, 'Wheat': 0, 'Sugarcane': 1, 
        'Barley': 1, 'Tobacco': 2, 'Oil seeds': 5, 'Pulses': 4, 'Millets': 1
    }
    df_fert['crop_encoded'] = df_fert['Crop Type'].map(crop_map_dataset).fillna(0).astype(int)
    
    # soil_map = {"Red": 0, "Black": 1, "Alluvial": 2, "Clay": 3, "Sandy": 4, "Loamy": 5}
    soil_map_dataset = {
        'Red': 0, 'Black': 1, 'Alluvial': 2, 'Clay': 3, 'Sandy': 4, 'Loamy': 5
    }
    df_fert['soil_encoded'] = df_fert['Soil Type'].map(soil_map_dataset).fillna(5).astype(int)
    
    # stage_map = {"Sowing": 0, "Vegetative": 1, "Flowering": 2, "Harvesting": 3}
    stage_map_dataset = {"Sowing": 0, "Vegetative": 1, "Flowering": 2, "Harvesting": 3}
    df_fert['stage_encoded'] = df_fert['Stage'].map(stage_map_dataset).fillna(0).astype(int)
    
    # Map target fertilizer name to label index:
    # FERTILIZER_LABELS = ["Urea", "DAP (Di-Ammonium Phosphate)", "MOP (Muriate of Potash)", 
    #                     "NPK 10:26:26", "NPK 20:20:20", "Ammonium Sulphate", 
    #                     "SSP (Single Super Phosphate)", "Zinc Sulphate"]
    fert_name_map = {
        'Urea': 0, 'DAP': 1, 'MOP': 2, '10-26-26': 3, '20-20': 4, '28-28': 4, '14-35-14': 3, '17-17-17': 4
    }
    df_fert['fert_encoded'] = df_fert['Fertilizer Name'].map(fert_name_map).fillna(4).astype(int)
    
    # Features & targets matching inference: [crop, soil, nitrogen, phosphorus, potassium, stage]
    X_f = df_fert[['crop_encoded', 'soil_encoded', 'Nitrogen', 'Phosphorous', 'Potassium', 'stage_encoded']].values
    y_f = df_fert['fert_encoded'].values
    
    dt_model = DecisionTreeClassifier(max_depth=6, random_state=42)
    dt_model.fit(X_f, y_f)
    
    with open("ml_models/fertilizer_recommendation.pkl", "wb") as f:
        pickle.dump(dt_model, f)
    
    print("[OK] Fertilizer Recommendation model trained and saved successfully!")
except Exception as e:
    print(f"[FAIL] Fertilizer Recommendation failed: {e}")


# ==========================================
# 3. YIELD prediction MODEL
# ==========================================
print("\n" + "="*50)
print("Training Yield Prediction Model...")
print("="*50)
try:
    df_prod = pd.read_csv(os.path.join(datasets_dir, "crop_production.csv"))
    # Clean missing production
    df_prod = df_prod.dropna(subset=['Production']).copy()
    
    # Filter for Telangana / Andhra Pradesh to speed up and keep it relevant
    df_prod_tg = df_prod[df_prod['State_Name'].str.contains('Telangana|Andhra Pradesh', case=False, na=False)].copy()
    if len(df_prod_tg) < 1000:
        df_prod_tg = df_prod.head(10000).copy()  # fallback if no matching rows
        
    print(f"Using {len(df_prod_tg)} rows for yield model training.")
    
    # Load Crop Recommendation for NPK/weather mapping
    df_crop_avg = pd.read_csv(os.path.join(datasets_dir, "Crop_recommendation.csv"))
    crop_averages = df_crop_avg.groupby('label').mean().reset_index()
    
    # Normalize crop names in both datasets for merging
    crop_name_mapping = {
        'paddy': 'rice', 'rice': 'rice', 'maize': 'maize', 'cotton(lint)': 'cotton', 
        'cotton': 'cotton', 'groundnut': 'groundnut', 'soyabean': 'soybean',
        'sugarcane': 'sugarcane', 'chickpea': 'chickpea', 'gram': 'chickpea'
    }
    
    df_prod_tg['crop_clean'] = df_prod_tg['Crop'].str.strip().str.lower().map(crop_name_mapping).fillna('rice')
    
    # Merge averages
    df_merged = df_prod_tg.merge(crop_averages, left_on='crop_clean', right_on='label', how='left')
    
    # Fill remaining NaNs with overall dataset averages
    df_merged['N'] = df_merged['N'].fillna(crop_averages['N'].mean())
    df_merged['P'] = df_merged['P'].fillna(crop_averages['P'].mean())
    df_merged['K'] = df_merged['K'].fillna(crop_averages['K'].mean())
    df_merged['temperature'] = df_merged['temperature'].fillna(crop_averages['temperature'].mean())
    df_merged['humidity'] = df_merged['humidity'].fillna(crop_averages['humidity'].mean())
    df_merged['rainfall'] = df_merged['rainfall'].fillna(crop_averages['rainfall'].mean())
    
    # Assign realistic soil types based on crop
    soil_map_dataset = {'rice': 3, 'cotton': 1, 'maize': 0, 'groundnut': 4}  # Clay=3, Black=1, Red=0, Sandy=4
    df_merged['soil_encoded'] = df_merged['crop_clean'].map(soil_map_dataset).fillna(5).astype(int)  # Loamy=5
    
    # crop_map = {"Rice": 0, "Maize": 1, "Cotton": 2, "Chickpea": 3, "Pigeon Peas": 4, "Groundnut": 5, "Soybean": 6, "Sugarcane": 7}
    crop_map_yield = {
        'rice': 0, 'maize': 1, 'cotton': 2, 'chickpea': 3, 'pigeonpeas': 4, 'groundnut': 5, 'soybean': 6, 'sugarcane': 7
    }
    df_merged['crop_encoded'] = df_merged['crop_clean'].map(crop_map_yield).fillna(0).astype(int)
    
    # Target is yield in quintals. Kaggle production is in Tonnes. 1 Tonne = 10 quintals.
    df_merged['yield_quintals'] = df_merged['Production'] * 10.0
    
    # Features: [crop_encoded, area_acres, soil_encoded, nitrogen, phosphorus, potassium, temperature, humidity, rainfall]
    X_y = df_merged[['crop_encoded', 'Area', 'soil_encoded', 'N', 'P', 'K', 'temperature', 'humidity', 'rainfall']].values
    y_y = df_merged['yield_quintals'].values
    
    # Train XGBoost Regressor
    xgb_model = XGBRegressor(n_estimators=30, max_depth=5, learning_rate=0.1, random_state=42, n_jobs=-1)
    xgb_model.fit(X_y, y_y)
    
    # Save model
    with open("ml_models/yield_prediction.pkl", "wb") as f:
        pickle.dump(xgb_model, f)
        
    print("[OK] Yield Prediction model trained and saved successfully!")
except Exception as e:
    print(f"[FAIL] Yield Prediction failed: {e}")


# ==========================================
# 4. MARKET PRICE FORECASTING (LSTM)
# ==========================================
print("\n" + "="*50)
print("Training Market Price Prediction Model...")
print("="*50)
try:
    df_price = pd.read_csv(os.path.join(datasets_dir, "market_prices.csv"))
    
    # Filter for Paddy (Dhan)(Common) which has the most records
    df_crop_price = df_price[df_price['crop_name'] == 'Paddy (Dhan)(Common)'].copy()
    
    # Group by date and calculate average price across Mandis to create a single time-series
    df_crop_price['date'] = pd.to_datetime(df_crop_price['date'])
    df_ts = df_crop_price.groupby('date')['price'].mean().reset_index().sort_values('date')
    
    print(f"Time-series contains {len(df_ts)} daily data points.")
    
    prices = df_ts['price'].values.reshape(-1, 1)
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_prices = scaler.fit_transform(prices)
    
    # Create sequences (lookback = 30 days)
    LOOKBACK = 30
    X_seq, y_val = [], []
    for i in range(LOOKBACK, len(scaled_prices)):
        X_seq.append(scaled_prices[i-LOOKBACK:i, 0])
        y_val.append(scaled_prices[i, 0])
    
    X_seq = np.array(X_seq)
    y_val = np.array(y_val)
    
    # Reshape X for LSTM: (samples, timesteps, features)
    X_seq = X_seq.reshape(X_seq.shape[0], X_seq.shape[1], 1)
    
    import tensorflow as tf
    from tensorflow.keras import layers, models
    
    # Define a lightweight LSTM model
    model = models.Sequential([
        layers.LSTM(32, input_shape=(LOOKBACK, 1)),
        layers.Dropout(0.2),
        layers.Dense(1)
    ])
    
    model.compile(optimizer='adam', loss='mse')
    
    # Train for 2 epochs only to be super fast on CPU
    model.fit(X_seq, y_val, epochs=2, batch_size=32, verbose=1)
    
    # Save
    model.save("ml_models/price_prediction.h5")
    with open("ml_models/price_prediction_scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)
        
    print("[OK] Price Prediction LSTM model trained and saved successfully!")
except Exception as e:
    print(f"[FAIL] Price Prediction failed: {e}")


# ==========================================
# 5. DISEASE DETECTION MODEL (CNN)
# ==========================================
print("\n" + "="*50)
print("Training Disease Detection Model...")
print("="*50)
try:
    pv_dir = os.path.join(datasets_dir, "PlantVillage")
    classes = sorted([d for d in os.listdir(pv_dir) if os.path.isdir(os.path.join(pv_dir, d))])
    
    # Save the class mapping JSON so inference maps correctly
    class_mapping = {str(i): cls for i, cls in enumerate(classes)}
    with open("ml_models/disease_classes.json", "w") as f:
        json.dump(class_mapping, f, indent=2)
    
    import tensorflow as tf
    from tensorflow.keras import layers, models
    from tensorflow.keras.applications import MobileNetV2
    from PIL import Image
    
    print(f"Classes: {classes}")
    
    # Since we want to train fast on CPU, we load only 10 images per class
    # and train for 1 epoch to create a valid MobileNetV2-based model file.
    X_img = []
    y_img = []
    
    for idx, cls in enumerate(classes):
        cls_dir = os.path.join(pv_dir, cls)
        img_names = [f for f in os.listdir(cls_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))][:10]
        for name in img_names:
            try:
                img_path = os.path.join(cls_dir, name)
                img = Image.open(img_path).resize((224, 224))
                img_arr = np.array(img) / 255.0
                if img_arr.shape == (224, 224, 3):
                    X_img.append(img_arr)
                    y_img.append(idx)
            except Exception:
                pass
                
    X_img = np.array(X_img)
    y_img = np.array(y_img)
    y_img_cat = tf.keras.utils.to_categorical(y_img, num_classes=len(classes))
    
    print(f"Loaded {len(X_img)} images for fast CNN training.")
    
    # Create MobileNetV2-based transfer learning model
    base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights='imagenet')
    base_model.trainable = False
    
    cnn_model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.2),
        layers.Dense(len(classes), activation='softmax')
    ])
    
    cnn_model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    
    # Train 1 epoch to instantiate weights and save
    cnn_model.fit(X_img, y_img_cat, epochs=1, batch_size=16, verbose=1)
    
    cnn_model.save("ml_models/disease_detection.h5")
    print("[OK] Disease Detection model trained and saved successfully!")
    
except Exception as e:
    print(f"[FAIL] Disease Detection failed: {e}")

print("\n" + "="*50)
print("ALL ML TRAINING TASKS COMPLETED!")
print("="*50)
