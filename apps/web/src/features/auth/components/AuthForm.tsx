import { useState, type FormEvent } from "react";

interface AuthFormProps {
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
}

type AuthMode = "sign-in" | "sign-up" | "reset-password";

export function AuthForm({
  isSubmitting,
  error,
  successMessage,
  onSignIn,
  onSignUp,
  onResetPassword,
}: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const isSignInMode = mode === "sign-in";
  const isSignUpMode = mode === "sign-up";
  const isResetPasswordMode = mode === "reset-password";

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setPasswordConfirmation("");
    setLocalError(null);
  }

  function handleModeChange(nextMode: AuthMode) {
    setMode(nextMode);
    resetForm();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLocalError(null);

    if (!email.trim()) {
      setLocalError("Informe seu e-mail.");
      return;
    }

    if (isResetPasswordMode) {
      await onResetPassword(email.trim());
      return;
    }

    if (!password) {
      setLocalError("Informe sua senha.");
      return;
    }

    if (isSignUpMode && !name.trim()) {
      setLocalError("Informe seu nome completo.");
      return;
    }

    if (isSignUpMode && password !== passwordConfirmation) {
      setLocalError("As senhas não conferem.");
      return;
    }

    if (isSignUpMode) {
      await onSignUp({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      return;
    }

    await onSignIn(email.trim(), password);
  }

  return (
    <section className="mx-auto mt-10 max-w-130 rounded-3xl border border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgb(15_23_42/0.08)]">
      <div>
        <p className="m-0 text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
          HelpSenior
        </p>

        <h1 className="mt-2 text-[32px] font-bold leading-tight text-slate-950">
          {isSignUpMode && "Criar conta"}
          {isSignInMode && "Entrar na conta"}
          {isResetPasswordMode && "Recuperar senha"}
        </h1>

        <p className="mt-2 text-base leading-6 text-slate-500">
          {isSignUpMode &&
            "Crie sua conta para salvar tarefas, lembretes, perfil e preferências."}

          {isSignInMode &&
            "Entre para acessar suas tarefas, lembretes e configurações."}

          {isResetPasswordMode &&
            "Informe seu e-mail para receber as instruções de redefinição de senha."}
        </p>
      </div>

      {!isResetPasswordMode && (
        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => handleModeChange("sign-in")}
            className={`min-h-11 rounded-xl font-bold ${
              isSignInMode
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500"
            }`}>
            Entrar
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("sign-up")}
            className={`min-h-11 rounded-xl font-bold ${
              isSignUpMode
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500"
            }`}>
            Criar conta
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        {isSignUpMode && (
          <label className="grid gap-2">
            <span className="font-bold text-slate-700">Nome completo</span>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Maria Silva"
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
              autoComplete="name"
              required
            />
          </label>
        )}

        <label className="grid gap-2">
          <span className="font-bold text-slate-700">E-mail</span>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seuemail@exemplo.com"
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
            autoComplete="email"
            required
          />
        </label>

        {!isResetPasswordMode && (
          <label className="grid gap-2">
            <span className="font-bold text-slate-700">Senha</span>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
              autoComplete={isSignUpMode ? "new-password" : "current-password"}
              required
            />
          </label>
        )}

        {isSignUpMode && (
          <label className="grid gap-2">
            <span className="font-bold text-slate-700">Confirmar senha</span>

            <input
              type="password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              placeholder="Digite a senha novamente"
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
              autoComplete="new-password"
              required
            />
          </label>
        )}

        {(localError || error) && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
            {localError || error}
          </p>
        )}

        {successMessage && (
          <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-bold text-green-700">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-12 rounded-xl bg-slate-950 px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting && "Aguarde..."}
          {!isSubmitting && isSignInMode && "Entrar"}
          {!isSubmitting && isSignUpMode && "Criar conta"}
          {!isSubmitting && isResetPasswordMode && "Enviar e-mail"}
        </button>
      </form>

      {isSignInMode && (
        <button
          type="button"
          onClick={() => handleModeChange("reset-password")}
          className="mt-4 w-full rounded-xl px-4 py-3 text-center font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950">
          Esqueci minha senha
        </button>
      )}

      {isResetPasswordMode && (
        <button
          type="button"
          onClick={() => handleModeChange("sign-in")}
          className="mt-4 w-full rounded-xl px-4 py-3 text-center font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950">
          Voltar para o login
        </button>
      )}
    </section>
  );
}
