import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import httpx

client = httpx.Client(timeout=60.0)  # 60s timeout for ML model loading

# Test 1: Health
r = client.get("http://127.0.0.1:8000/health")
print("1. Health:", r.json())

# Test 2: Government Schemes
r = client.get("http://127.0.0.1:8000/api/schemes/")
print(f"2. Schemes: {len(r.json())} records loaded ✅")

# Test 3: Crop Recommendation (loads Random Forest model)
r = client.post("http://127.0.0.1:8000/api/crops/recommend", json={
    "nitrogen": 90, "phosphorus": 42, "potassium": 43,
    "temperature": 30, "humidity": 80, "ph": 6.5, "rainfall": 200
})
print(f"3. Crop Recommendation: {r.json()}")

# Test 4: Farmer Registration
r = client.post("http://127.0.0.1:8000/api/auth/register", json={
    "name": "Ravi Kumar",
    "mobile_number": "9876543210",
    "village": "Kondapur",
    "mandal": "Serilingampally",
    "district": "Rangareddy",
    "latitude": 17.4600,
    "longitude": 78.3500,
    "land_size_acres": 5.0,
    "soil_type": "Black Cotton",
    "water_source": "Borewell"
})
print(f"4. Registration: {r.status_code} - {r.json()}")

# Test 5: Yield Prediction (loads XGBoost model)
r = client.post("http://127.0.0.1:8000/api/yield/predict", json={
    "crop_name": "Rice", "area_acres": 5.0, "soil_type": "Black Cotton",
    "nitrogen": 80, "phosphorus": 40, "potassium": 40,
    "temperature": 30, "humidity": 75, "rainfall": 180
})
print(f"5. Yield Prediction: {r.json()}")

# Test 6: Fertilizer Recommendation (loads Decision Tree model)
r = client.post("http://127.0.0.1:8000/api/fertilizer/recommend", json={
    "crop_name": "Rice", "soil_type": "Black Cotton",
    "nitrogen": 80, "phosphorus": 40, "potassium": 40,
    "crop_stage": "Vegetative"
})
print(f"6. Fertilizer Recommendation: {r.json()}")

print("\n✅ All tests complete!")
client.close()
