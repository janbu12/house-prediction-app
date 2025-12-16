# House Price Prediction (Prediksi Harga Rumah)

Aplikasi web sederhana untuk memprediksi harga rumah menggunakan Machine Learning.

Project ini terdiri dari **Backend** (Python/FastAPI) yang menangani logika prediksi & model ML, dan **Frontend** (React + Vite + Tailwind) sebagai antarmuka pengguna.

## Struktur Folder Project

Pastikan susunan folder Anda terlihat seperti ini agar aplikasi berjalan lancar:

```text
house-prediction/
│
├── backend/
│   ├── app/
│   │   └── main.py              # Kode utama API
│   ├── venv/                    # Virtual Environment
│   ├── poly_ridge_model_3.joblib # Model ML (Pastikan ada di sini)
│   ├── poly_transform_3.joblib   # Transformer (Pastikan ada di sini)
│   └── requirements.txt         # Daftar library
│
└── frontend/
    ├── src/                     # React components, hooks, styles
    ├── public/
    └── package.json             # Dependensi frontend (React, Vite, Tailwind)
```
## Teknologi
Backend: Python 3.x, FastAPI, Scikit-Learn, Numpy, Joblib.  
Frontend: React 19, Vite, TypeScript, Tailwind CSS 4.  
Data: Model dilatih menggunakan Polynomial Ridge Regression.

<b>Cara Menjalankan Aplikasi</b>
Ikuti langkah-langkah berikut untuk menjalankan project di komputer lokal (Localhost).

1. Menjalankan Backend (Server)
   - Buka terminal / CMD.
   - Masuk ke folder backend:
        ```bash
        cd backend
        ```
   - Aktifkan Virtual Environment:
     Windows:
        ```bash
        python -m venv venv
        venv\Scripts\activate
        ```
     Mac / Linux:
        ```bash
        source venv/bin/activate
        ```
   - Install dependencies (jika belum):
        ```Bash
        pip install -r requirements.txt
        ```
   - Jalankan server:
        ```bash
        uvicorn app.main:app --reload
        ```
        <b>Note</b>: Jika berhasil, terminal akan menampilkan: <i>Application startup complete. Uvicorn running on https://www.google.com/search?q=http://127.0.0.1:8000</i>

2. Menjalankan Frontend (UI)
   - Buka terminal baru, masuk ke folder frontend:
        ```bash
        cd frontend
        npm install
        npm run dev
        ```
   - Buka URL dev server yang muncul (misal http://localhost:5173).
   - Isi form per langkah, lalu klik “Prediksi Harga”.

### API Endpoint
Jika ingin mengetes via Postman:
  - URL: POST http://127.0.0.1:8000/predict
  - Body (JSON):
    ```JSON
    {
        "bedrooms": 3,
        "bathrooms": 2,
        "sqft_living": 1800,
        "sqft_lot": 4000,
        "floors": 1,
        "waterfront": 0,
        "condition": 3,
        "grade": 7,
        "sqft_above": 1800,
        "sqft_basement": 0,
        "yr_built": 1995,
        "yr_renovated": 0
    }
    ```

### Catatan Satuan Input
- Form di frontend meminta **meter persegi (m2)** untuk semua field luas (mis. `sqft_living`, `sqft_lot`, `sqft_above`, `sqft_basement`).  
- Backend otomatis mengonversi nilai m2 tersebut ke **square feet (sqft)** sebelum dikirim ke model.
