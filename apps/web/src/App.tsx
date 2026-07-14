import { lazy, Suspense } from "react";

import { useAuth } from "./features/auth/hooks/useAuth";
import { LoginPage } from "./pages/LoginPage";

import "./index.css";

const AuthenticatedApp = lazy(() =>
  import("./AuthenticatedApp").then((module) => ({
    default: module.AuthenticatedApp,
  })),
);

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

  if (isLoadingAuth) {
    return <AppLoadingFallback />;
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="app-shell min-h-screen bg-slate-50 text-slate-950">
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
    <Suspense fallback={<AppLoadingFallback />}>
      <AuthenticatedApp user={user} onSignOut={signOut} />
    </Suspense>
  );
}

function AppLoadingFallback() {
  return (
    <main
      className="app-shell min-h-screen bg-slate-50 px-6 py-10 text-slate-950"
      aria-live="polite"
      aria-busy="true"
    >
      <section className="app-container mx-auto max-w-6xl">
        <p className="text-base text-slate-600">Carregando aplicação...</p>
      </section>
    </main>
  );
}

export default App;
