import type { ComponentProps } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { HomePage } from "../pages/HomePage";
import { ProfilePage } from "../pages/ProfilePage";
import { RemindersPage } from "../pages/RemindersPage";
import { SettingsPage } from "../pages/SettingsPage";
import { TaskPage } from "../pages/TaskPage";
import { ActivityPage } from "../pages/ActivityPage";

interface AppRoutesProps {
  homePageProps: ComponentProps<typeof HomePage>;
  taskPageProps: ComponentProps<typeof TaskPage>;
  profilePageProps: ComponentProps<typeof ProfilePage>;
  remindersPageProps: ComponentProps<typeof RemindersPage>;
  settingsPageProps: ComponentProps<typeof SettingsPage>;
}

export function AppRoutes({
  homePageProps,
  taskPageProps,
  profilePageProps,
  remindersPageProps,
  settingsPageProps,
}: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/bla" element={<HomePage {...homePageProps} />} />
      <Route
        path="/"
        // path="/atividades"
        element={<ActivityPage {...taskPageProps} />}
      />
      <Route
        path="/tarefas"
        element={<TaskPage {...taskPageProps} />}
      />
      <Route
        path="/lembretes"
        element={<RemindersPage {...remindersPageProps} />}
      />
      <Route
        path="/perfil"
        element={<ProfilePage {...profilePageProps} />}
      />
      <Route
        path="/configuracoes"
        element={<SettingsPage {...settingsPageProps} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
