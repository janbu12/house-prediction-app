import { useState } from "react";
import type { FormEvent } from "react";
import type { PredictionInput, PredictionResponse } from "../types/prediction";
import ResultCard from "./ResultCard";

const initialState: PredictionInput = {
  bedrooms: 0,
  bathrooms: 0,
  sqft_living: 0,
  sqft_lot: 0,
  floors: 0,
  waterfront: 0,
  condition: 0,
  grade: 0,
  sqft_above: 0,
  sqft_basement: 0,
  yr_built: 0,
  yr_renovated: 0,
};

const fields: {
  name: keyof PredictionInput;
  label: string;
  helper: string;
  type?: "binary";
}[] = [
  { name: "bedrooms", label: "Jumlah kamar tidur", helper: "Masukkan jumlah kamar tidur (bilangan bulat)." },
  { name: "bathrooms", label: "Jumlah kamar mandi", helper: "Boleh desimal, misal 1.5 untuk 1 kamar mandi + 1 toilet." },
  { name: "sqft_living", label: "Luas bangunan (m2)", helper: "Isi dalam meter persegi" },
  { name: "sqft_lot", label: "Luas tanah (m2)", helper: "Isi dalam meter persegi" },
  { name: "floors", label: "Jumlah lantai", helper: "Total lantai bangunan" },
  {
    name: "waterfront",
    label: "Tepi laut?",
    helper: "Pilih Iya jika rumah punya frontage/akses langsung ke laut/danau/sungai; jika tidak, pilih Tidak.",
    type: "binary",
  },
  { name: "condition", label: "Kondisi bangunan", helper: "Skala 1 (buruk) sampai 5 (sangat baik)." },
  { name: "grade", label: "Grade konstruksi", helper: "Skala 1 - 13 (kualitas material/arsitektur)." },
  { name: "sqft_above", label: "Luas di atas tanah (m2)", helper: "Luas ruang di atas permukaan tanah dalam meter persegi (otomatis dikonversi ke sqft)." },
  { name: "sqft_basement", label: "Luas basement (m2)", helper: "Isi 0 jika tidak ada basement; meter persegi, dikonversi ke sqft." },
  { name: "yr_built", label: "Tahun dibangun", helper: "Contoh: 1995." },
  { name: "yr_renovated", label: "Tahun renovasi", helper: "Isi 0 jika belum pernah renovasi, atau tahun renovasi terakhir." },
];

const steps = [
  {
    key: "land",
    title: "Pertanahan & Luas",
    description: "Isi informasi luas lahan dan bangunan.",
    fields: ["sqft_lot", "sqft_living", "sqft_above", "sqft_basement", "waterfront"] as const,
  },
  {
    key: "rooms",
    title: "Ruangan",
    description: "Jumlah kamar dan lantai.",
    fields: ["bedrooms", "bathrooms", "floors"] as const,
  },
  {
    key: "condition",
    title: "Kondisi & Tahun",
    description: "Isi kondisi bangunan, grade, dan tahun.",
    fields: ["condition", "grade", "yr_built", "yr_renovated"] as const,
  },
];

export default function PredictionForm() {
  const [form, setForm] = useState<PredictionInput>(initialState);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
   const [step, setStep] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("http://127.0.0.1:8000/predict", {
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

  return (
    <>
      <form onSubmit={e => {
        e.preventDefault();
        if (!isLastStep) {
          setStep(prev => Math.min(prev + 1, steps.length - 1));
          return;
        }
        handleSubmit(e);
      }}>
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
                <span className={`h-6 w-6 flex items-center justify-center rounded-full text-xs font-semibold ${
                  idx === step ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                }`}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {fields
            .filter(f => currentStep.fields.includes(f.name as (typeof currentStep.fields)[number]))
            .map(field => (
              <div key={field.name}>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {field.label}
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{field.helper}</p>

                {field.type === "binary" ? (
                  <div className="mt-3 flex gap-4 text-sm text-slate-700 dark:text-slate-200">
                    {[{ value: 1, label: "Iya" }, { value: 0, label: "Tidak" }].map(option => (
                      <label key={option.value} className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name={field.name}
                          value={option.value}
                          defaultChecked={option.value === form[field.name]}
                          onChange={handleChange}
                          className="h-4 w-4 text-slate-900 dark:text-slate-100"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    name={field.name}
                    type="number"
                    onChange={handleChange}
                    className="
                      w-full mt-2 rounded-xl border
                      border-slate-300 dark:border-slate-700
                      bg-white dark:bg-slate-800
                      px-4 py-3
                      text-slate-700 dark:text-slate-200
                    "
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

      {result && <ResultCard result={result} />}
    </>
  );
}
