import type { UserPreferences } from "@helpsenior/core";
import type { ImageStyle, TextStyle, ViewStyle } from "react-native";

export type AccessibilityStyle = ViewStyle & TextStyle & ImageStyle;

const fontScales: Record<UserPreferences["fontSize"], number> = {
  small: 0.875,
  medium: 1,
  large: 1.125,
  extra_large: 1.25,
};

const spacingProperties = [
  "gap",
  "rowGap",
  "columnGap",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "paddingHorizontal",
  "paddingVertical",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "marginHorizontal",
  "marginVertical",
] as const;

function highContrastColor(color: string) {
  const normalizedColor = color.toUpperCase();

  if (
    normalizedColor === "#FFFFFF" ||
    normalizedColor === "#F8FAFC" ||
    normalizedColor === "#F1F5F9" ||
    normalizedColor === "#F5F3FF"
  ) {
    return "#111111";
  }

  if (
    normalizedColor === "#6D28D9" ||
    normalizedColor === "#5B21B6" ||
    normalizedColor === "#4C1D95" ||
    normalizedColor === "#7C3AED"
  ) {
    return "#FACC15";
  }

  if (
    normalizedColor === "#0F172A" ||
    normalizedColor === "#1E293B" ||
    normalizedColor === "#334155" ||
    normalizedColor === "#475569" ||
    normalizedColor === "#64748B" ||
    normalizedColor === "#94A3B8"
  ) {
    return "#FFFFFF";
  }

  return color;
}

export function transformAccessibilityStyle(
  style: AccessibilityStyle,
  preferences: UserPreferences | null,
) {
  if (!preferences) return style;

  const transformed: AccessibilityStyle = { ...style };
  const fontScale = fontScales[preferences.fontSize];

  if (typeof transformed.fontSize === "number") {
    transformed.fontSize = Math.round(transformed.fontSize * fontScale);
  }

  if (typeof transformed.lineHeight === "number") {
    transformed.lineHeight = Math.round(transformed.lineHeight * fontScale);
  }

  if (preferences.increasedSpacing) {
    for (const property of spacingProperties) {
      const value = transformed[property];
      if (typeof value === "number") {
        transformed[property] = Math.round(value * 1.25);
      }
    }

    if (typeof transformed.minHeight === "number") {
      transformed.minHeight = Math.round(transformed.minHeight * 1.15);
    }
  }

  if (preferences.reduceMotion && transformed.transform) {
    delete transformed.transform;
  }

  if (preferences.contrast === "high") {
    if (typeof transformed.color === "string") {
      transformed.color = highContrastColor(transformed.color);
    }
    if (typeof transformed.backgroundColor === "string") {
      transformed.backgroundColor = highContrastColor(
        transformed.backgroundColor,
      );
    }
    if (typeof transformed.borderColor === "string") {
      transformed.borderColor = "#FFFFFF";
    }
    transformed.shadowOpacity = 0;
  }

  return transformed;
}
