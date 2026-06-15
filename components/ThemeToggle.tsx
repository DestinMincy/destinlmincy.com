"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const storageKey = "dlm-theme";

/**
 * Determines the current theme setting.
 *
 * @returns The active theme: `"light"` or `"dark"`.
 */
function readTheme(): Theme {
  const currentTheme = document.documentElement.dataset.theme;

  if (currentTheme === "light" || currentTheme === "dark") {
    return currentTheme;
  }

  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Applies a theme to the document element.
 */
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

/**
 * A button component that toggles the application theme between light and dark modes.
 *
 * The selected theme is persisted to browser storage and applied to the document.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const label = theme === null ? "Theme" : theme === "dark" ? "Dark" : "Light";

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function handleToggle() {
    const nextTheme = (theme ?? readTheme()) === "dark" ? "light" : "dark";

    try {
      localStorage.setItem(storageKey, nextTheme);
    } catch {
      // Storage can be blocked; the UI should still apply the selected theme.
    }

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
