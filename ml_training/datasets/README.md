# 📦 Datasets Directory

Download the following datasets from Kaggle and place them here before running the training notebooks.

## Required Datasets

| Model | File Name | Source |
|---|---|---|
| Crop Recommendation | `Crop_recommendation.csv` | [Kaggle: Crop Recommendation](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset) |
| Disease Detection | `PlantVillage/` (folder) | [Kaggle: PlantVillage](https://www.kaggle.com/datasets/emmarex/plantdisease) |
| Yield Prediction | `Telangana_CropStats.csv` | Telangana DES & Open Data Portal |
| Price Prediction | `market_prices_clean.csv` | [Agmarknet](https://agmarknet.gov.in) / data.gov.in |
| Fertilizer Recommendation | `Fertilizer_Prediction_v2.csv` | [Kaggle: Fertilizer Prediction](https://www.kaggle.com/datasets/gdabhishek/fertilizer-prediction) (Cleaned) |

## Expected Directory Structure

```
datasets/
├── Crop_recommendation.csv
├── Fertilizer_Prediction_v2.csv
├── Telangana_CropStats.csv
├── market_prices_clean.csv
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
