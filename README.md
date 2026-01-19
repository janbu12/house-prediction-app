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
        uvicorn app.bandung:app --reload
        ```
        <b>Note</b>: Jika berhasil, terminal akan menampilkan: <i>Application startup complete. Uvicorn running on http://127.0.0.1:8000</i>

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
        "Land": 120,
        "Building": 90,
        "Bedroom": 3,
        "Bathroom": 2,
        "Carport": 1,
        "Latitude": -6.9175,
        "Longitude": 107.6191,
        "Month": 5,
        "City_Regency": "Kota Bandung",
        "Location": "Bojongloa Kaler"
    }
    ```

### Catatan Satuan Input
- Form di frontend meminta **meter persegi (m2)** untuk field luas (`Land`, `Building`).
