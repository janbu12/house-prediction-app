import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Map, Marker } from "pigeon-maps";
import type { PredictionInput, PredictionResponse } from "../types/prediction";
import ResultCard from "./ResultCard";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const initialState: PredictionInput = {
  Land: 0,
  Building: 0,
  Bedroom: 0,
  Bathroom: 0,
  Carport: 0,
  Latitude: 0,
  Longitude: 0,
  Month: new Date().getMonth() + 1,
  City_Regency: "",
  Location: "",
};

const fields: {
  name: keyof PredictionInput;
  label: string;
  helper: string;
  min?: number;
  max?: number;
  step?: number;
}[] = [
  { name: "Land", label: "Luas tanah (m2)", helper: "Isi dalam meter persegi.", min: 1 },
  { name: "Building", label: "Luas bangunan (m2)", helper: "Isi dalam meter persegi.", min: 1 },
  { name: "Bedroom", label: "Jumlah kamar tidur", helper: "Bilangan bulat.", min: 1, max: 20, step: 1 },
  { name: "Bathroom", label: "Jumlah kamar mandi", helper: "Boleh desimal, misal 1.5.", min: 1, max: 20, step: 0.5 },
  { name: "Carport", label: "Jumlah carport/garasi", helper: "Total kapasitas parkir tertutup.", min: 0, max: 10, step: 1 },
  { name: "Month", label: "Bulan transaksi", helper: "Otomatis diisi bulan berjalan.", min: 1, max: 12, step: 1 },
  { name: "Latitude", label: "Latitude", helper: "Klik peta untuk mengisi otomatis.", step: 0.000001 },
  { name: "Longitude", label: "Longitude", helper: "Klik peta untuk mengisi otomatis.", step: 0.000001 },
  { name: "City_Regency", label: "Kota/Kabupaten", helper: "Terisi otomatis dari peta, bisa disunting manual." },
  { name: "Location", label: "Kecamatan", helper: "Terisi otomatis dari peta, bisa disunting manual." },
];

const steps = [
  {
    key: "property",
    title: "Data Properti",
    description: "Isi informasi luas, kamar, carport, dan bulan.",
    fields: ["Land", "Building", "Bedroom", "Bathroom", "Carport", "Month"] as const,
  },
  {
    key: "location",
    title: "Lokasi",
    description: "Klik peta untuk pilih titik, otomatis isi kota & kecamatan.",
    fields: ["Latitude", "Longitude", "City_Regency", "Location"] as const,
  },
];

export default function PredictionForm() {
  const [form, setForm] = useState<PredictionInput>(initialState);
  const [filled, setFilled] = useState<Record<keyof PredictionInput, boolean>>(
    Object.keys(initialState).reduce(
      (acc, key) => ({ ...acc, [key]: key === "Month" }), // Month auto terisi
      {} as Record<keyof PredictionInput, boolean>
    )
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [step, setStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const hasValue = value !== "";
    setFilled(prev => ({ ...prev, [name]: hasValue }));
    setForm(prev => ({ ...prev, [name]: hasValue ? Number(value) : 0 }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const hasValue = value.trim() !== "";
    setFilled(prev => ({ ...prev, [name]: hasValue }));
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data: PredictionResponse = await res.json();
    setResult(data);
    setLoading(false);
  };

  const isLastStep = step === steps.length - 1;
  const currentStep = steps[step];
  const canProceedStep = currentStep.fields.every(f => filled[f]);
  const allFilled = steps.every(s => s.fields.every(f => filled[f]));

  const notifyMissing = (fieldsList: readonly (keyof PredictionInput)[]) => {
    const missing = fieldsList.find(f => !filled[f]);
    if (missing) {
      const label = fields.find(f => f.name === missing)?.label ?? missing;
      setToast(`Harap isi ${label} terlebih dahulu.`);
      setTimeout(() => setToast(null), 2200);
    }
  };

  const handleMapClick = async ({ latLng }: { latLng: [number, number] }) => {
    const [lat, lng] = latLng;
    setForm(prev => ({ ...prev, Latitude: lat, Longitude: lng }));
    setFilled(prev => ({ ...prev, Latitude: true, Longitude: true }));
    try {
      setGeoLoading(true);
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "id" } });
      const data = await res.json();
      const addr = data?.address || {};
      const city =
        addr.city || addr.town || addr.state_district || addr.state || addr.county || addr.village || "";
      const district =
        addr.city_district || addr.suburb || addr.village || addr.town || addr.district || "";
      setForm(prev => ({
        ...prev,
        City_Regency: city || prev.City_Regency,
        Location: district || prev.Location,
      }));
      setFilled(prev => ({
        ...prev,
        City_Regency: !!(city || prev.City_Regency),
        Location: !!(district || prev.Location),
      }));
    } catch {
      setToast("Gagal mengambil kota/kecamatan dari peta, isi manual.");
      setTimeout(() => setToast(null), 2200);
    } finally {
      setGeoLoading(false);
    }
  };

  const mapCenter = useMemo<[number, number]>(() => {
    if (form.Latitude && form.Longitude) return [form.Latitude, form.Longitude];
    return [-6.9175, 107.6191]; // Default Bandung
  }, [form.Latitude, form.Longitude]);

  return (
    <>
      <form
        onSubmit={e => {
          e.preventDefault();
          setShowErrors(true);
          if (!isLastStep) {
            if (canProceedStep) {
              setShowErrors(false);
              setStep(prev => Math.min(prev + 1, steps.length - 1));
            } else {
              notifyMissing(currentStep.fields);
            }
            return;
          }
          if (allFilled) {
            setShowErrors(false);
            handleSubmit(e);
          } else {
            notifyMissing(steps.flatMap(s => s.fields) as (keyof PredictionInput)[]);
          }
        }}
      >
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row md:flex-wrap gap-3">
            {steps.map((s, idx) => (
              <div
                key={s.key}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition w-full md:w-auto ${
                  idx === step
                    ? "border-slate-900 dark:border-slate-100 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                    : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <span
                  className={`h-6 w-6 flex items-center justify-center rounded-full text-xs font-semibold ${
                    idx === step
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="text-left">
                  <div className="text-sm font-semibold leading-tight">{s.title}</div>
                  <div className="text-xs leading-tight">{s.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {currentStep.key === "location" && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
            <Map
              height={280}
              defaultCenter={mapCenter}
              center={mapCenter}
              defaultZoom={12}
              onClick={handleMapClick}
            >
              {form.Latitude !== 0 && form.Longitude !== 0 && <Marker width={40} anchor={mapCenter} />}
            </Map>
            <div className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300">
              {geoLoading ? "Mengambil kota/kecamatan dari titik..." : "Klik peta untuk memilih lokasi."}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {fields
            .filter(f => new Set<keyof PredictionInput>(currentStep.fields).has(f.name))
            .map(field => (
              <div key={field.name}>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {field.label}
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{field.helper}</p>

                {field.name === "City_Regency" || field.name === "Location" ? (
                  <input
                    name={field.name}
                    type="text"
                    onChange={handleTextChange}
                    value={form[field.name]}
                    className="
                      w-full mt-2 rounded-xl border
                      border-slate-300 dark:border-slate-700
                      bg-white dark:bg-slate-800
                      px-4 py-3
                      text-slate-700 dark:text-slate-200
                    "
                    style={
                      showErrors && !filled[field.name]
                        ? { borderColor: "rgba(239,68,68,0.8)", boxShadow: "0 0 0 1px rgba(239,68,68,0.4)" }
                        : undefined
                    }
                  />
                ) : (
                  <input
                    name={field.name}
                    type="number"
                    onChange={handleChange}
                    value={filled[field.name] ? form[field.name] : ""}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    disabled={field.name === "Month"}
                    className="
                      w-full mt-2 rounded-xl border
                      border-slate-300 dark:border-slate-700
                      bg-white dark:bg-slate-800
                      px-4 py-3
                      text-slate-700 dark:text-slate-200
                    "
                    style={
                      showErrors && !filled[field.name]
                        ? { borderColor: "rgba(239,68,68,0.8)", boxShadow: "0 0 0 1px rgba(239,68,68,0.4)" }
                        : undefined
                    }
                  />
                )}
              </div>
            ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={() => setStep(prev => Math.max(prev - 1, 0))}
            disabled={step === 0}
            className="
              px-4 py-3 rounded-xl border
              border-slate-300 dark:border-slate-700
              text-slate-700 dark:text-slate-200
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            Kembali
          </button>

          <button
            type="submit"
            disabled={loading}
            className="
              px-6 py-3 rounded-xl
              bg-slate-900 dark:bg-slate-100
              text-white dark:text-slate-900
              font-semibold transition
            "
          >
            {loading ? "Menghitung..." : isLastStep ? "Prediksi Harga" : "Selanjutnya"}
          </button>
        </div>
      </form>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-lg bg-red-500 text-white text-sm z-50">
          {toast}
        </div>
      )}

      {result && <ResultCard result={result} />}
    </>
  );
}
