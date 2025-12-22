import type { PredictionResponse, SimilarItem } from "../types/prediction";

interface ResultCardProps {
  result: PredictionResponse;
}

export default function ResultCard({ result }: ResultCardProps) {
  return (
    <div className="mt-8 space-y-6">
      <div
        className="
          p-8 rounded-2xl
          bg-linear-to-r from-slate-900 to-slate-700
          text-white text-center shadow-xl
          animate-fade-in
        "
      >
        <p className="text-slate-300">Estimasi Harga Rumah</p>

        <h2 className="text-4xl font-bold mt-3">{result.formatted}</h2>

        <p className="text-slate-400 mt-2 text-sm">
          Perkiraan angka: Rp {result.predicted_price.toLocaleString("id-ID")}
        </p>
      </div>

      {result.similar && result.similar.length > 0 && (
        <SimilarList items={result.similar} />
      )}
    </div>
  );
}

function SimilarList({ items }: { items: SimilarItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
        Properti Mirip
      </h3>
      <div className="grid gap-3">
        {items.map((item, idx) => (
          <div
            key={`${item.Location}-${idx}`}
            className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {item.Location} • {item["City/Regency"]}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Rp {item.Price.toLocaleString("id-ID")}
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {item.Bedroom} KT • {item.Bathroom} KM • {item.Carport} Carport
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tanah {item.Land} m² • Bangunan {item.Building} m²
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${item.Latitude},${item.Longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-sky-600 dark:text-sky-300 underline"
            >
              Lihat di Google Maps
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
