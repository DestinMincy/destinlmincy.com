export const THEME_STORAGE_KEY = "dlm-theme";

export type Theme = "light" | "dark";

/**
 * Applies a theme to the document element.
 */
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}
