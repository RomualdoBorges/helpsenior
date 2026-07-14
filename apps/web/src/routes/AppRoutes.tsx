import { lazy, Suspense, type ComponentProps } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const HomePage = lazy(() =>
  import("../pages/HomePage").then((module) => ({
    default: module.HomePage,
  })),
);

const ProfilePage = lazy(() =>
  import("../pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);

const RemindersPage = lazy(() =>
  import("../pages/RemindersPage").then((module) => ({
    default: module.RemindersPage,
  })),
);

const SettingsPage = lazy(() =>
  import("../pages/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  })),
);

const WelcomePage = lazy(() =>
  import("../pages/WelcomePage").then((module) => ({
    default: module.WelcomePage,
  })),
);

interface AppRoutesProps {
  homePageProps: ComponentProps<typeof HomePage>;
  profilePageProps: ComponentProps<typeof ProfilePage>;
  remindersPageProps: ComponentProps<typeof RemindersPage>;
  settingsPageProps: ComponentProps<typeof SettingsPage>;
}

export function AppRoutes({
  homePageProps,
  profilePageProps,
  remindersPageProps,
  settingsPageProps,
}: AppRoutesProps) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/tarefas" element={<HomePage {...homePageProps} />} />
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
    </Suspense>
  );
}

function RouteLoadingFallback() {
  return (
    <section
      className="mx-auto mt-8 w-full max-w-6xl"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="text-base text-slate-600">Carregando página...</p>
    </section>
  );
}
