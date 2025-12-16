import { useEffect, useState } from "react";

export function useDarkMode(): [boolean, () => void] {
  const getInitial = () => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  };

  const [dark, setDark] = useState<boolean>(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Keep color-scheme in sync for native UI (form controls, etc).
    root.style.colorScheme = dark ? "dark" : "light";

    root.classList.toggle("dark", dark);
    body.classList.toggle("dark", dark);

    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    // React to OS preference changes only when user hasn't explicitly chosen.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setDark(event.matches);
      }
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const toggle = () => setDark(prev => !prev);

  return [dark, toggle];
}
