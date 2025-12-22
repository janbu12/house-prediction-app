from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
import joblib
from pathlib import Path

# =====================
# Load model & schema
# =====================
BASE_DIR = Path(__file__).resolve().parent.parent
model = joblib.load(BASE_DIR / "house_price_model_bandung.joblib")
schema = joblib.load(BASE_DIR / "training_schema.joblib")
SIMILAR_DF = pd.read_csv(BASE_DIR / "dataset" / "clean_df.csv")

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


def haversine(lat1, lon1, lat2, lon2):
    r = 6371  # km
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)
    a = np.sin(dphi / 2) ** 2 + np.cos(phi1) * np.cos(phi2) * np.sin(dlambda / 2) ** 2
    return 2 * r * np.arcsin(np.sqrt(a))


def find_similar(data: HouseInput, predicted_price: float, top_n: int = 5):
    df = SIMILAR_DF.copy()

    # Filter ringan berdasarkan kota/kecamatan jika ada
    if data.City_Regency:
        mask_city = df["City/Regency"].str.lower() == data.City_Regency.lower()
        if mask_city.any():
            df = df[mask_city]
    if data.Location and not df.empty:
        mask_loc = df["Location"].str.lower() == data.Location.lower()
        if mask_loc.any():
            df = df[mask_loc]

    # Harga
    price_denom = max(predicted_price, 1)
    df["price_gap"] = (df["Price"] - predicted_price).abs() / price_denom

    # Spesifikasi (bed, bath, carport, land, building)
    spec_gap = np.zeros(len(df))
    spec_fields = [
        ("Bedroom", data.Bedroom, 5),
        ("Bathroom", data.Bathroom, 5),
        ("Carport", data.Carport, 5),
        ("Land", data.Land, max(data.Land or 1, 1)),
        ("Building", data.Building, max(data.Building or 1, 1)),
    ]
    for col, val, denom in spec_fields:
        if val is not None:
            spec_gap += (df[col] - val).abs() / max(denom, 1)
    df["spec_gap"] = spec_gap

    # Jarak geografis (opsional)
    has_geo = data.Latitude is not None and data.Longitude is not None
    if has_geo:
        df["geo_km"] = haversine(data.Latitude, data.Longitude, df["Latitude"], df["Longitude"])
        df["geo_gap"] = df["geo_km"] / 50  # skala 50 km
    else:
        df["geo_gap"] = 0

    price_weight = 0.5
    geo_weight = 0.3 if has_geo else 0
    spec_weight = 1 - price_weight - geo_weight

    df["score"] = (
        price_weight * df["price_gap"]
        + geo_weight * df["geo_gap"]
        + spec_weight * df["spec_gap"]
    )

    cols = [
        "Price",
        "Location",
        "City/Regency",
        "Bedroom",
        "Bathroom",
        "Carport",
        "Land",
        "Building",
        "Latitude",
        "Longitude",
        "Month",
    ]

    return df.sort_values("score").head(top_n)[cols].to_dict(orient="records")

# =====================
# Endpoint prediction
# =====================
@app.post("/predict")
def predict_price(data: HouseInput):
    X_ready = prepare_input(data.dict())

    price_numeric, price_rupiah = predict_price_rupiah(model, X_ready)
    similar = find_similar(data, price_numeric)

    return {
        "predicted_price": round(price_numeric, 0),
        "formatted": price_rupiah,
        "similar": similar
    }
