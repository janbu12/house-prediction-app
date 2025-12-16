import DarkToggle from "./components/DarkToggle";
import PredictionForm from "./components/PredictionForm";
import { useDarkMode } from "./hooks/useDarkMode";

export default function App() {
  const [dark, toggleDark] = useDarkMode();

  return (
    <div
      className="
        min-h-screen flex items-center justify-center px-3 sm:px-4 py-6
        bg-slate-100 dark:bg-slate-900 transition-colors
      "
    >
      <div
        className="
          w-full max-w-5xl bg-white dark:bg-slate-800
          rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10
        "
      >
        <div className="flex items-start justify-between gap-4 mb-6 md:mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white leading-tight">
              Prediksi Harga Rumah
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
              Estimasi harga rumah berbasis machine learning
            </p>
          </div>

          <DarkToggle dark={dark} onToggle={toggleDark} />
        </div>

        <PredictionForm />
      </div>
    </div>
  );
}
