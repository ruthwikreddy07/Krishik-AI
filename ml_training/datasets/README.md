# 📦 Datasets Directory

Download the following datasets from Kaggle and place them here before running the training notebooks.

## Required Datasets

| Model | File Name | Source |
|---|---|---|
| Crop Recommendation | `Crop_recommendation.csv` | [Kaggle: Crop Recommendation](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset) |
| Disease Detection | `PlantVillage/` (folder) | [Kaggle: PlantVillage](https://www.kaggle.com/datasets/emmarex/plantdisease) |
| Yield Prediction | `crop_production.csv` | [Kaggle: Crop Production India](https://www.kaggle.com/datasets/abhinand05/crop-production-in-india) |
| Price Prediction | `market_prices.csv` | [Agmarknet](https://agmarknet.gov.in) or custom scraped data |
| Fertilizer Recommendation | `Fertilizer_Prediction.csv` | [Kaggle: Fertilizer Prediction](https://www.kaggle.com/datasets/gdabhishek/fertilizer-prediction) |

## Expected Directory Structure

```
datasets/
├── Crop_recommendation.csv
├── Fertilizer_Prediction.csv
├── crop_production.csv
├── market_prices.csv
└── PlantVillage/
    ├── Apple___Apple_scab/
    ├── Apple___Black_rot/
    ├── Corn_(maize)___Common_rust/
    ├── Rice___Brown_spot/
    ├── Cotton___Bacterial_blight/
    └── ... (each folder = one disease class with images)
```

## Notes
- Do **NOT** commit large datasets to Git. Add this folder to `.gitignore`.
- For the PlantVillage dataset, you may add additional Telangana-specific crop images (Cotton, Chilli, Turmeric) for better local accuracy.
