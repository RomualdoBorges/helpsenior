import { useNavigate } from "react-router-dom";

import { AuthForm } from "../features/auth/components/AuthForm";

interface LoginPageProps {
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSignUp: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
}

export function LoginPage({
  isSubmitting,
  error,
  successMessage,
  onSignIn,
  onSignUp,
  onResetPassword,
}: LoginPageProps) {
  const navigate = useNavigate();

  async function handleSignIn(email: string, password: string) {
    const isSignedIn = await onSignIn(email, password);

    if (isSignedIn) {
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="app-container grid min-h-screen w-full bg-white lg:grid-cols-2">
        <header className="flex flex-col justify-center bg-black px-6 py-12 text-white sm:px-10 lg:min-h-screen lg:px-16">
          <p className="app-eyebrow mb-2 text-sm font-bold uppercase tracking-[0.08em] text-slate-300">
            HelpSenior
          </p>

          <h1 className="m-0 max-w-180 text-[44px] font-bold leading-[1.1] text-white">
            Organize atividades com mais clareza e segurança.
          </h1>

          <p className="app-description mt-4 max-w-170 text-xl leading-[1.6] text-slate-300">
            Crie tarefas simples e lembretes recorrentes para ajudar pessoas
            idosas a acompanhar a rotina com mais autonomia.
          </p>
        </header>

        <div className="flex w-full items-center px-6 py-10 sm:px-10 lg:px-16">
          <AuthForm
            isSubmitting={isSubmitting}
            error={error}
            successMessage={successMessage}
            onSignIn={handleSignIn}
            onSignUp={onSignUp}
            onResetPassword={onResetPassword}
          />
        </div>
      </div>
    </div>
  );
}
