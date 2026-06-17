import pandas as pd
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

datasets_dir = "ml_training/datasets"

# 1. Crop Recommendation
print("=" * 60)
print("1. CROP RECOMMENDATION (Crop_recommendation.csv)")
print("=" * 60)
try:
    df = pd.read_csv(os.path.join(datasets_dir, "Crop_recommendation.csv"))
    print(f"Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print(f"Target classes: {df['label'].nunique()} crops")
    print(f"Crops: {sorted(df['label'].unique())}")
    print(df.head(3).to_string())
    print("[OK] VALID")
except Exception as e:
    print(f"[FAIL] ERROR: {e}")

# 2. Fertilizer Prediction
print("\n" + "=" * 60)
print("2. FERTILIZER PREDICTION (Fertilizer_Prediction.csv)")
print("=" * 60)
try:
    df = pd.read_csv(os.path.join(datasets_dir, "Fertilizer_Prediction.csv"))
    print(f"Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    if 'Fertilizer Name' in df.columns:
        print(f"Fertilizer types: {df['Fertilizer Name'].nunique()}")
        print(f"Fertilizers: {list(df['Fertilizer Name'].unique())}")
    print(df.head(3).to_string())
    print("[OK] VALID")
except Exception as e:
    print(f"[FAIL] ERROR: {e}")

# 3. Crop Production
print("\n" + "=" * 60)
print("3. YIELD / CROP PRODUCTION (crop_production.csv)")
print("=" * 60)
try:
    df = pd.read_csv(os.path.join(datasets_dir, "crop_production.csv"))
    print(f"Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    if 'State_Name' in df.columns:
        print(f"States: {df['State_Name'].nunique()}")
    if 'Crop' in df.columns:
        print(f"Crops: {df['Crop'].nunique()}")
    print(df.head(3).to_string())
    print("[OK] VALID")
except Exception as e:
    print(f"[FAIL] ERROR: {e}")

# 4. Market Prices -- SPECIAL ATTENTION
print("\n" + "=" * 60)
print("4. MARKET PRICES (market_prices.csv) -- DETAILED CHECK")
print("=" * 60)
try:
    df = pd.read_csv(os.path.join(datasets_dir, "market_prices.csv"))
    print(f"Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print(f"\nData types:\n{df.dtypes}")
    print(f"\nFull content (first 20 rows):")
    print(df.head(20).to_string())
    print(f"\nFile size: {os.path.getsize(os.path.join(datasets_dir, 'market_prices.csv'))} bytes")
    
    # Check if it has the expected columns for LSTM notebook
    expected_cols = ['date', 'crop_name', 'mandi_name', 'price']
    missing = [c for c in expected_cols if c not in df.columns]
    if missing:
        print(f"\n[WARNING] MISSING expected columns: {missing}")
        print(f"   The LSTM notebook expects: {expected_cols}")
        print(f"   Your file has: {list(df.columns)}")
        print("\n   --> The notebook will need to be updated to match your dataset columns.")
    else:
        print("\n[OK] Has all expected columns")
    
    print(f"\nBasic stats:")
    print(df.describe(include='all').to_string())
except Exception as e:
    print(f"[FAIL] ERROR: {e}")

# 5. PlantVillage
print("\n" + "=" * 60)
print("5. PLANTVILLAGE (PlantVillage/ folder)")
print("=" * 60)
pv_dir = os.path.join(datasets_dir, "PlantVillage")
if os.path.exists(pv_dir):
    classes = [d for d in os.listdir(pv_dir) if os.path.isdir(os.path.join(pv_dir, d))]
    print(f"Number of disease classes: {len(classes)}")
    total_images = 0
    for cls in sorted(classes):
        cls_path = os.path.join(pv_dir, cls)
        n = len([f for f in os.listdir(cls_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        total_images += n
        print(f"  {cls}: {n} images")
    print(f"\nTotal images: {total_images}")
    if total_images > 0:
        print("[OK] VALID")
    else:
        print("[FAIL] NO IMAGES FOUND")
else:
    print("[FAIL] PlantVillage directory not found!")
