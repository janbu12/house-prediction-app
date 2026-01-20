import type { PredictionInput, PredictionResponse, SimilarItem } from "../types/prediction";

interface ResultCardProps {
  result: PredictionResponse;
  input: PredictionInput;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildRumah123Url(input: PredictionInput, predictedPrice?: number) {
  const city = "bandung";
  const land = Math.max(1, Math.round(input.Land));
  const building = Math.max(1, Math.round(input.Building));
  const minPrice = 50_000_000;
  const maxPrice = predictedPrice ? Math.round(predictedPrice * 1.2) : 1_000_000_000;

  const params = new URLSearchParams();
  if (input.Location) {
    params.set("place", input.Location);
  }
  params.set("bathroom", String(Math.max(1, Math.round(input.Bathroom))));
  params.set("bedroom", String(Math.max(1, Math.round(input.Bedroom))));
  params.append("propertyFacilities[]", "15");
  params.set("maxBuiltupSize", String(building));
  params.set("maxLandArea", String(land));
  params.set("maxPrice", String(maxPrice));
  params.set("minPrice", String(minPrice));

  return `https://www.rumah123.com/jual/${city}/rumah/?${params.toString()}`;
}

function buildRumah123RegionUrl(region: string, input: PredictionInput, predictedPrice?: number) {
  const city = "bandung";
  const land = Math.max(1, Math.round(input.Land));
  const building = Math.max(1, Math.round(input.Building));
  const minPrice = 50_000_000;
  const maxPrice = predictedPrice ? Math.round(predictedPrice * 1.2) : 1_000_000_000;

  const params = new URLSearchParams();
  params.set("bathroom", String(Math.max(1, Math.round(input.Bathroom))));
  params.set("bedroom", String(Math.max(1, Math.round(input.Bedroom))));
  params.append("propertyFacilities[]", "15");
  params.set("maxBuiltupSize", String(building));
  params.set("maxLandArea", String(land));
  params.set("maxPrice", String(maxPrice));
  params.set("minPrice", String(minPrice));

  return `https://www.rumah123.com/jual/${city}/${slugify(region)}/rumah/?${params.toString()}`;
}

function getRegionLinks(items: SimilarItem[], input: PredictionInput, predictedPrice?: number) {
  const regionSet = new Map<string, string>();
  items.forEach(item => {
    const region = item.Location?.trim();
    if (!region) return;
    const slug = slugify(region);
    if (!regionSet.has(slug)) {
      regionSet.set(slug, region);
    }
  });

  return Array.from(regionSet.entries()).map(([slug, label]) => ({
    slug,
    label,
    url: buildRumah123RegionUrl(label, input, predictedPrice),
  }));
}

export default function ResultCard({ result, input }: ResultCardProps) {
  const rumah123Url = buildRumah123Url(input, result.predicted_price);
  const regionLinks = getRegionLinks(result.similar ?? [], input, result.predicted_price);

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

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
          Properti Aktual
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Buka listing rumah yang sesuai spesifikasi Anda di Rumah123.
        </p>
        {regionLinks.length === 0 ? (
          <a
            href={rumah123Url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-sm font-semibold"
          >
            Lihat Properti Aktual
          </a>
        ) : (
          <div className="flex flex-wrap gap-2">
            {regionLinks.map(link => (
              <a
                key={link.slug}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold"
              >
                Lihat Properti Aktual Wilayah {link.label}
              </a>
            ))}
          </div>
        )}
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
