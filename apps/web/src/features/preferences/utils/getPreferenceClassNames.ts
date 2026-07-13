import type { UserPreferences } from "@helpsenior/core";

export function getPreferenceClassNames(
  preferences: UserPreferences | null,
): string {
  if (!preferences) {
    return "";
  }

  return [
    `font-size-${preferences.fontSize}`,
    preferences.contrast === "high" ? "high-contrast" : "",
    preferences.simpleMode ? "simple-mode" : "",
    preferences.increasedSpacing ? "increased-spacing" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
