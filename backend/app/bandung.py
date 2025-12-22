from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
import joblib

# =====================
# Load model & schema
# =====================
model = joblib.load("house_price_model_bandung.joblib")
schema = joblib.load("training_schema.joblib")

EXPECTED_FEATURES = schema["features"]
NUMERIC_COLS = schema["numeric_features"]
CATEGORICAL_COLS = schema["categorical_features"]

# =====================
# FastAPI init
# =====================
app = FastAPI(title="Bandung House Price Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # aman untuk demo / skripsi
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# Schema input user
# (semua optional → fleksibel)
# =====================
class HouseInput(BaseModel):
    Land: float | None = None
    Building: float | None = None
    Bedroom: float | None = None
    Bathroom: float | None = None
    Carport: float | None = None
    Latitude: float | None = None
    Longitude: float | None = None
    Month: int | None = None
    City_Regency: str | None = None
    Location: str | None = None

# =====================
# Helper functions
# =====================
def prepare_input(data: dict) -> pd.DataFrame:
    X = pd.DataFrame([data])

    # Tambahkan kolom yang hilang
    for col in EXPECTED_FEATURES:
        if col not in X.columns:
            X[col] = np.nan

    # Urutkan kolom
    X = X[EXPECTED_FEATURES]

    # Numerik
    for col in NUMERIC_COLS:
        X[col] = pd.to_numeric(X[col], errors="coerce")

    # Kategorikal
    for col in CATEGORICAL_COLS:
        X[col] = X[col].astype("string").fillna("Unknown")

    return X


def format_rupiah(value: float) -> str:
    return f"Rp {value:,.0f}".replace(",", ".")


def predict_price_rupiah(model, X_input: pd.DataFrame):
    log_price = model.predict(X_input)[0]
    real_price = np.expm1(log_price)
    return real_price, format_rupiah(real_price)

# =====================
# Endpoint prediction
# =====================
@app.post("/predict")
def predict_price(data: HouseInput):
    X_ready = prepare_input(data.dict())

    price_numeric, price_rupiah = predict_price_rupiah(model, X_ready)

    return {
        "predicted_price": round(price_numeric, 0),
        "formatted": price_rupiah
    }
