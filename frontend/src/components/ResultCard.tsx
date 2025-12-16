import type { PredictionResponse } from "../types/prediction";

interface ResultCardProps {
  result: PredictionResponse;
}

export default function ResultCard({ result }: ResultCardProps) {
  return (
    <div
      className="
        mt-8 p-8 rounded-2xl
        bg-gradient-to-r from-slate-900 to-slate-800
        text-white text-center shadow-xl
        animate-fade-in
      "
    >
      <p className="text-slate-300">Estimasi Harga Rumah</p>

      <h2 className="text-4xl font-bold mt-3">
        Rp {result.price_idr.toLocaleString("id-ID")}
      </h2>

      <p className="text-slate-400 mt-2">
        ≈ ${result.price_usd.toLocaleString("en-US")}
      </p>

      <p className="text-xs text-slate-500 mt-1">
        Kurs USD–IDR: {result.exchange_rate}
      </p>
    </div>
  );
}
