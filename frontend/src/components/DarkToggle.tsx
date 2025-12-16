interface DarkToggleProps {
  dark: boolean;
  onToggle: () => void;
}

import { Moon, Sun } from "lucide-react";

export default function DarkToggle({ dark, onToggle }: DarkToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="
        rounded-xl px-4 py-2 border
        border-slate-300 dark:border-slate-700
        text-slate-700 dark:text-slate-200
        hover:bg-slate-100 dark:hover:bg-slate-800
        transition
      "
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
