import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { AuthForm } from "./features/auth/components/AuthForm";
import { useAuth } from "./features/auth/hooks/useAuth";
import { useUserPreferences } from "./features/preferences/hooks/useUserPreferences";
import { getPreferenceClassNames } from "./features/preferences/utils/getPreferenceClassNames";
import { useUserProfile } from "./features/profile/hooks/useUserProfile";
import { useCurrentTime } from "./features/reminders/hooks/useCurrentTime";
import { useReminderNotifications } from "./features/reminders/hooks/useReminderNotifications";
import { useReminders } from "./features/reminders/hooks/useReminders";
import { getDueReminders } from "./features/reminders/utils/getDueReminders";
import { AppRoutes } from "./routes/AppRoutes";
import { AppBar } from "./shared/layout/AppBar";
import { AppFooter } from "./shared/layout/AppFooter";
import { classNames } from "./shared/ui";

import "./index.css";

function App() {
  const navigate = useNavigate();

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

  async function handleSignIn(email: string, password: string) {
    const isSignedIn = await signIn(email, password);

    if (isSignedIn) {
      navigate("/", { replace: true });
    }
  }

  if (isLoadingAuth) {
    return (
      <main
        className={classNames(
          "app-shell min-h-screen bg-white px-6 py-10 text-slate-950",
          accessibilityClassName,
        )}>
        <section className="app-container mx-auto max-w-190">
          <p className="text-base text-slate-600">Carregando aplicação...</p>
        </section>
      </main>
    );
  }

  return (
    <>
      {isAuthenticated && user && (
        <AppBar
          dueReminders={dueReminders}
          email={user.email}
          userName={profile?.name}
          onSignOut={signOut}
        />
      )}

      <main
        className={classNames(
          "app-shell flex min-h-screen flex-col bg-white px-6 text-slate-950",
          isAuthenticated && user ? "authenticated-shell pt-24" : "pt-10",
          "footer-shell",
          accessibilityClassName,
        )}>
        <section className="app-container mx-auto w-full max-w-300 flex-1">
          {/* <header>
          <p className="app-eyebrow mb-2 text-sm font-bold uppercase tracking-[0.08em] text-slate-500">
            HelpSenior
          </p>

          <h1 className="m-0 max-w-180 text-[44px] font-bold leading-[1.1] text-slate-950">
            Organize atividades com mais clareza e segurança.
          </h1>

          <p className="app-description mt-4 max-w-170 text-xl leading-[1.6] text-slate-600">
            Crie tarefas simples e lembretes recorrentes para ajudar pessoas
            idosas a acompanhar a rotina com mais autonomia.
          </p>
        </header> */}

          {!isAuthenticated || !user ? (
            <>
              <header>
                <p className="app-eyebrow mb-2 text-sm font-bold uppercase tracking-[0.08em] text-slate-500">
                  HelpSenior
                </p>

                <h1 className="m-0 max-w-180 text-[44px] font-bold leading-[1.1] text-slate-950">
                  Organize atividades com mais clareza e segurança.
                </h1>

                <p className="app-description mt-4 max-w-170 text-xl leading-[1.6] text-slate-600">
                  Crie tarefas simples e lembretes recorrentes para ajudar
                  pessoas idosas a acompanhar a rotina com mais autonomia.
                </p>
              </header>

              <AuthForm
                isSubmitting={isSubmittingAuth}
                error={authError}
                successMessage={authSuccessMessage}
                onSignIn={handleSignIn}
                onSignUp={signUp}
                onResetPassword={resetPassword}
              />
            </>
          ) : (
            <AppRoutes
              taskPageProps={{ user }}
              remindersPageProps={{
                user,
                reminders,
                dueReminders,
                isLoadingReminders,
                isCreatingReminder,
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
          )}
        </section>

        <AppFooter />
      </main>
    </>
  );
}

export default App;
