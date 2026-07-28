import type {
  ContrastPreference,
  FontSizePreference,
  UserPreferences,
} from "@helpsenior/core";
import { createContext, useContext, type ReactNode } from "react";
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from "react-native";

import { useAuth } from "@/src/features/auth/useAuth";

import { useUserPreferences } from "./useUserPreferences";
import {
  transformAccessibilityStyle,
  type AccessibilityStyle,
} from "./accessibilityStyles";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

interface UpdatePreferencesInput {
  fontSize?: FontSizePreference;
  contrast?: ContrastPreference;
  simpleMode?: boolean;
  reduceMotion?: boolean;
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

export function createAccessibleStyleSheet<T extends NamedStyles<T>>(styles: T) {
  let cachedVersion = -1;
  let cachedStyles = StyleSheet.create(styles);

  return new Proxy(cachedStyles, {
    get(_target, property: string) {
      if (cachedVersion !== styleVersion) {
        const transformedStyles = Object.fromEntries(
          Object.entries(styles).map(([name, style]) => [
            name,
            transformAccessibilityStyle(
              style as AccessibilityStyle,
              activePreferences,
            ),
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
