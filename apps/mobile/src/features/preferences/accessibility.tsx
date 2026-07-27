import type {
  ContrastPreference,
  FontSizePreference,
  UserPreferences,
} from "@helpsenior/core";
import { createContext, useContext, type ReactNode } from "react";
import {
  StyleSheet,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useAuth } from "@/src/features/auth/useAuth";

import { useUserPreferences } from "./useUserPreferences";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };
type AccessibilityStyle = ViewStyle & TextStyle & ImageStyle;

interface UpdatePreferencesInput {
  fontSize?: FontSizePreference;
  contrast?: ContrastPreference;
  simpleMode?: boolean;
  increasedSpacing?: boolean;
}

interface AccessibilityContextValue {
  preferences: UserPreferences | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  updatePreferences: (input: UpdatePreferencesInput) => Promise<void>;
}

const defaultContext: AccessibilityContextValue = {
  preferences: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  updatePreferences: async () => undefined,
};

const AccessibilityContext =
  createContext<AccessibilityContextValue>(defaultContext);

let activePreferences: UserPreferences | null = null;
let styleVersion = 0;

const fontScales: Record<FontSizePreference, number> = {
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

function transformStyle(style: AccessibilityStyle) {
  if (!activePreferences) return style;

  const transformed: AccessibilityStyle = { ...style };
  const fontScale = fontScales[activePreferences.fontSize];

  if (typeof transformed.fontSize === "number") {
    transformed.fontSize = Math.round(transformed.fontSize * fontScale);
  }

  if (typeof transformed.lineHeight === "number") {
    transformed.lineHeight = Math.round(transformed.lineHeight * fontScale);
  }

  if (activePreferences.increasedSpacing) {
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

  if (activePreferences.contrast === "high") {
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

export function createAccessibleStyleSheet<T extends NamedStyles<T>>(styles: T) {
  let cachedVersion = -1;
  let cachedStyles = StyleSheet.create(styles);

  return new Proxy(cachedStyles, {
    get(_target, property: string) {
      if (cachedVersion !== styleVersion) {
        const transformedStyles = Object.fromEntries(
          Object.entries(styles).map(([name, style]) => [
            name,
            transformStyle(style as AccessibilityStyle),
          ]),
        ) as T;
        cachedStyles = StyleSheet.create(transformedStyles);
        cachedVersion = styleVersion;
      }

      return cachedStyles[property as keyof T];
    },
  });
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const preferencesState = useUserPreferences(user?.id ?? null);

  if (activePreferences !== preferencesState.preferences) {
    activePreferences = preferencesState.preferences;
    styleVersion += 1;
  }

  return (
    <AccessibilityContext.Provider value={preferencesState}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
