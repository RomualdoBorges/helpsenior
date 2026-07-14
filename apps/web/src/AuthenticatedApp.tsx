import { useEffect, useMemo } from "react";

import type { AuthUser } from "@helpsenior/firebase/auth";

import { useUserPreferences } from "./features/preferences/hooks/useUserPreferences";
import { getPreferenceClassNames } from "./features/preferences/utils/getPreferenceClassNames";
import { useUserProfile } from "./features/profile/hooks/useUserProfile";
import { useCurrentTime } from "./features/reminders/hooks/useCurrentTime";
import { useReminders } from "./features/reminders/hooks/useReminders";
import { getDueReminders } from "./features/reminders/utils/getDueReminders";
import { AppRoutes } from "./routes/AppRoutes";
import { AppBar } from "./shared/layout/AppBar";
import { classNames } from "./shared/ui";

interface AuthenticatedAppProps {
  user: AuthUser;
  onSignOut: () => Promise<void>;
}

export function AuthenticatedApp({
  user,
  onSignOut,
}: AuthenticatedAppProps) {
  const {
    preferences,
    isLoadingPreferences,
    isUpdatingPreferences,
    preferencesError,
    updatePreferences,
  } = useUserPreferences(user.id);

  const {
    profile,
    isLoadingProfile,
    isUpdatingProfile,
    profileError,
    updateProfile,
  } = useUserProfile({
    userId: user.id,
    email: user.email,
  });

  const {
    reminders,
    isLoadingReminders,
    isCreatingReminder,
    isUpdatingReminder,
    isDeletingReminder,
    remindersError,
    createReminder,
    updateReminder,
    completeReminder,
    deleteReminder,
  } = useReminders(user.id);

  const currentTime = useCurrentTime();

  const dueReminders = useMemo(
    () => getDueReminders(reminders, currentTime),
    [currentTime, reminders],
  );

  const accessibilityClassName = getPreferenceClassNames(preferences);

  useEffect(() => {
    const preferenceClassNames = accessibilityClassName
      .split(" ")
      .filter(Boolean);

    document.documentElement.classList.add(...preferenceClassNames);

    return () => {
      document.documentElement.classList.remove(...preferenceClassNames);
    };
  }, [accessibilityClassName]);

  return (
    <main
      className={classNames(
        "app-shell min-h-screen bg-slate-50 px-6 py-10 text-slate-950",
        accessibilityClassName,
      )}
    >
      <section className="app-container mx-auto min-h-screen max-w-6xl bg-white px-6 pb-10">
        <AppBar
          alerts={dueReminders}
          userName={profile?.name}
          userEmail={user.email}
          onSignOut={onSignOut}
        />

        <AppRoutes
          homePageProps={{ user }}
          remindersPageProps={{
            reminders,
            dueReminders,
            isLoadingReminders,
            isCreatingReminder,
            isUpdatingReminder,
            isDeletingReminder,
            remindersError,
            createReminder,
            updateReminder,
            completeReminder,
            deleteReminder,
          }}
          profilePageProps={{
            profile,
            isLoadingProfile,
            isUpdatingProfile,
            profileError,
            updateProfile,
          }}
          settingsPageProps={{
            preferences,
            isLoadingPreferences,
            isUpdatingPreferences,
            preferencesError,
            updatePreferences,
          }}
        />
      </section>
    </main>
  );
}
