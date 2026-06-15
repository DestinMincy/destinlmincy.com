"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const storageKey = "dlm-theme";

function readTheme(): Theme {
  const currentTheme = document.documentElement.dataset.theme;

  if (currentTheme === "light" || currentTheme === "dark") {
    return currentTheme;
  }

  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const label = theme === null ? "Theme" : theme === "dark" ? "Dark" : "Light";

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function handleToggle() {
    const nextTheme = (theme ?? readTheme()) === "dark" ? "light" : "dark";

    localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
    setTheme(nextTheme);
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      aria-pressed={theme === "dark"}
      onClick={handleToggle}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb" />
      </span>
      <span className="theme-toggle__label">{label}</span>
    </button>
  );
}
