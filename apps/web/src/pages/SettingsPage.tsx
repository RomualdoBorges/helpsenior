import type {
  ContrastPreference,
  FontSizePreference,
  UserPreferences,
} from "@helpsenior/core";

import { UserPreferencesPanel } from "../features/preferences/components/UserPreferencesPanel";

interface SettingsPageProps {
  preferences: UserPreferences | null;
  isLoadingPreferences: boolean;
  isUpdatingPreferences: boolean;
  preferencesError: string | null;
  updatePreferences: (input: {
    fontSize?: FontSizePreference;
    contrast?: ContrastPreference;
    simpleMode?: boolean;
    increasedSpacing?: boolean;
  }) => Promise<void>;
}

export function SettingsPage({
  preferences,
  isLoadingPreferences,
  isUpdatingPreferences,
  preferencesError,
  updatePreferences,
}: SettingsPageProps) {
  return (
    <UserPreferencesPanel
      preferences={preferences}
      isLoading={isLoadingPreferences}
      isUpdating={isUpdatingPreferences}
      error={preferencesError}
      onUpdatePreferences={updatePreferences}
    />
  );
}
