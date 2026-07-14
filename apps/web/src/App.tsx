import { useEffect, useMemo } from "react";
import { useAuth } from "./features/auth/hooks/useAuth";
import { useUserPreferences } from "./features/preferences/hooks/useUserPreferences";
import { getPreferenceClassNames } from "./features/preferences/utils/getPreferenceClassNames";
import { useUserProfile } from "./features/profile/hooks/useUserProfile";
import { useCurrentTime } from "./features/reminders/hooks/useCurrentTime";
import { useReminderNotifications } from "./features/reminders/hooks/useReminderNotifications";
import { useReminders } from "./features/reminders/hooks/useReminders";
import { getDueReminders } from "./features/reminders/utils/getDueReminders";
import { LoginPage } from "./pages/LoginPage";
import { AppRoutes } from "./routes/AppRoutes";
import { AppBar } from "./shared/layout/AppBar";
import { classNames } from "./shared/ui";

import "./index.css";

function App() {
  const {
    user,
    isAuthenticated,
    isLoadingAuth,
    isSubmittingAuth,
    authError,
    authSuccessMessage,
    signUp,
    signIn,
    resetPassword,
    signOut,
  } = useAuth();

  const {
    preferences,
    isLoadingPreferences,
    isUpdatingPreferences,
    preferencesError,
    updatePreferences,
  } = useUserPreferences(user?.id ?? null);

  const {
    profile,
    isLoadingProfile,
    isUpdatingProfile,
    profileError,
    updateProfile,
  } = useUserProfile({
    userId: user?.id ?? null,
    email: user?.email ?? null,
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
  } = useReminders(user?.id ?? null);

  const currentTime = useCurrentTime();

  const dueReminders = useMemo(
    () => getDueReminders(reminders, currentTime),
    [currentTime, reminders],
  );

  const {
    permission: notificationPermission,
    requestPermission: requestNotificationPermission,
    isNotificationSupported,
    isNotificationAllowed,
    isNotificationDenied,
  } = useReminderNotifications(dueReminders);

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

  if (isLoadingAuth) {
    return (
      <main
        className={classNames(
          "app-shell min-h-screen bg-slate-50 px-6 py-10 text-slate-950",
          accessibilityClassName,
        )}
      >
        <section className="app-container mx-auto max-w-6xl">
          <p className="text-base text-slate-600">Carregando aplicação...</p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <main
        className={classNames(
          "app-shell min-h-screen bg-slate-50 text-slate-950",
          accessibilityClassName,
        )}
      >
        <LoginPage
          isSubmitting={isSubmittingAuth}
          error={authError}
          successMessage={authSuccessMessage}
          onSignIn={signIn}
          onSignUp={signUp}
          onResetPassword={resetPassword}
        />
      </main>
    );
  }

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
          onSignOut={signOut}
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
            notificationPermission,
            requestNotificationPermission,
            isNotificationSupported,
            isNotificationAllowed,
            isNotificationDenied,
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

export default App;
