import DarkToggle from "./components/DarkToggle";
import PredictionForm from "./components/PredictionForm";
import { useDarkMode } from "./hooks/useDarkMode";

export default function App() {
  const [dark, toggleDark] = useDarkMode();

  return (
    <div
      className="
        min-h-screen flex items-center justify-center p-4
        bg-slate-100 dark:bg-slate-900 transition-colors
      "
    >
      <div
        className="
          w-full max-w-5xl bg-white dark:bg-slate-800
          rounded-3xl shadow-2xl p-10
        "
      >
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-white">
              Prediksi Harga Rumah
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
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
