from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import numpy as np
import joblib

# =====================
# Load model & transformer
# =====================
model3 = joblib.load("poly_ridge_model_3.joblib")
poly3 = joblib.load("poly_transform_3.joblib")

def get_usd_to_idr():
    try:
        url = "https://v6.exchangerate-api.com/v6/25661eecb19ce735a51b4f3c/latest/USD"
        res = requests.get(url, timeout=5)
        data = res.json()
        return data["rates"]["IDR"]
    except:
        # fallback manual (kalau API mati)
        return 15500

FEATURE_ORDER = [
    'bedrooms',
    'bathrooms',
    'sqft_living',
    'sqft_lot',
    'floors',
    'waterfront',
    'condition',
    'grade',
    'sqft_above',
    'sqft_basement',
    'yr_built',
    'yr_renovated'
]

app = FastAPI(title="House Price Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # sementara, aman untuk demo/skripsi
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# Schema input user
# =====================
class HouseInput(BaseModel):
    bedrooms: float
    bathrooms: float
    sqft_living: float
    sqft_lot: float
    floors: float
    waterfront: int        # 0 / 1
    condition: int         # 1 - 5
    grade: int             # 1 - 13
    sqft_above: float
    sqft_basement: float = 0
    yr_built: int
    yr_renovated: int = 0

# =====================
# Endpoint prediction
# =====================
@app.post("/predict")
def predict_price(data: HouseInput):
    x_raw = np.array([[getattr(data, f) for f in FEATURE_ORDER]])
    x_poly = poly3.transform(x_raw)

    price_usd = float(model3.predict(x_poly)[0])

    kurs_idr = get_usd_to_idr()
    price_idr = price_usd * kurs_idr

    return {
        "price_usd": round(price_usd, 2),
        "price_idr": round(price_idr, 0),
        "exchange_rate": kurs_idr
    }
