import { useMemo } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";

import { AuthForm } from "./features/auth/components/AuthForm";
import { useAuth } from "./features/auth/hooks/useAuth";
import { useUserPreferences } from "./features/preferences/hooks/useUserPreferences";
import { getPreferenceClassNames } from "./features/preferences/utils/getPreferenceClassNames";
import { useUserProfile } from "./features/profile/hooks/useUserProfile";
import { useCurrentTime } from "./features/reminders/hooks/useCurrentTime";
import { useReminderNotifications } from "./features/reminders/hooks/useReminderNotifications";
import { useReminders } from "./features/reminders/hooks/useReminders";
import { getDueReminders } from "./features/reminders/utils/getDueReminders";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { RemindersPage } from "./pages/RemindersPage";
import { SettingsPage } from "./pages/SettingsPage";
import { Button, classNames } from "./shared/ui";

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

  if (isLoadingAuth) {
    return (
      <main
        className={classNames(
          "app-shell min-h-screen bg-slate-50 px-6 py-10 text-slate-950",
          accessibilityClassName,
        )}
      >
        <section className="app-container mx-auto max-w-190">
          <p className="text-base text-slate-600">Carregando aplicação...</p>
        </section>
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
      <section className="app-container mx-auto max-w-190">
        <header>
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
        </header>

        {!isAuthenticated || !user ? (
          <AuthForm
            isSubmitting={isSubmittingAuth}
            error={authError}
            successMessage={authSuccessMessage}
            onSignIn={signIn}
            onSignUp={signUp}
            onResetPassword={resetPassword}
          />
        ) : (
          <>
            <section className="user-bar mt-8 flex items-center justify-between gap-4 rounded-2xl border border-slate-300 bg-white px-5 py-4">
              <div>
                <strong className="block text-slate-950">
                  {profile?.name ? `Olá, ${profile.name}` : "Conta conectada"}
                </strong>

                <p className="mt-1 text-slate-500">{user.email}</p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={signOut}
              >
                Sair
              </Button>
            </section>

            <nav className="mt-6 flex gap-3">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  classNames(
                    "rounded-xl border px-4 py-3 font-bold no-underline",
                    isActive
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-950",
                  )
                }
              >
                Tarefas
              </NavLink>

              <NavLink
                to="/lembretes"
                className={({ isActive }) =>
                  classNames(
                    "rounded-xl border px-4 py-3 font-bold no-underline",
                    isActive
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-950",
                  )
                }
              >
                Lembretes
              </NavLink>

              <NavLink
                to="/perfil"
                className={({ isActive }) =>
                  classNames(
                    "rounded-xl border px-4 py-3 font-bold no-underline",
                    isActive
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-950",
                  )
                }
              >
                Perfil
              </NavLink>

              <NavLink
                to="/configuracoes"
                className={({ isActive }) =>
                  classNames(
                    "rounded-xl border px-4 py-3 font-bold no-underline",
                    isActive
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-950",
                  )
                }
              >
                Configurações
              </NavLink>
            </nav>

            <Routes>
              <Route path="/" element={<HomePage user={user} />} />

              <Route
                path="/lembretes"
                element={
                  <RemindersPage
                    reminders={reminders}
                    dueReminders={dueReminders}
                    isLoadingReminders={isLoadingReminders}
                    isCreatingReminder={isCreatingReminder}
                    isUpdatingReminder={isUpdatingReminder}
                    isDeletingReminder={isDeletingReminder}
                    remindersError={remindersError}
                    createReminder={createReminder}
                    updateReminder={updateReminder}
                    completeReminder={completeReminder}
                    deleteReminder={deleteReminder}
                    notificationPermission={notificationPermission}
                    requestNotificationPermission={
                      requestNotificationPermission
                    }
                    isNotificationSupported={isNotificationSupported}
                    isNotificationAllowed={isNotificationAllowed}
                    isNotificationDenied={isNotificationDenied}
                  />
                }
              />

              <Route
                path="/perfil"
                element={
                  <ProfilePage
                    profile={profile}
                    isLoadingProfile={isLoadingProfile}
                    isUpdatingProfile={isUpdatingProfile}
                    profileError={profileError}
                    updateProfile={updateProfile}
                  />
                }
              />

              <Route
                path="/configuracoes"
                element={
                  <SettingsPage
                    preferences={preferences}
                    isLoadingPreferences={isLoadingPreferences}
                    isUpdatingPreferences={isUpdatingPreferences}
                    preferencesError={preferencesError}
                    updatePreferences={updatePreferences}
                  />
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </>
        )}
      </section>
    </main>
  );
}

export default App;
