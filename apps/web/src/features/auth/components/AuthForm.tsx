import { useState, type FormEvent } from "react";

import { Alert, Button, FormField, Input } from "../../../shared/ui";

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
    <section className="w-full max-w-150 justify-self-center rounded-3xl bg-white p-6 shadow-[0_16px_40px_rgb(109_40_217/0.12)] lg:p-8">
      <div>
        <p className="m-0 text-sm font-bold uppercase tracking-[0.12em] text-violet-700">
          HelpSenior
        </p>

        <h1 className="mt-2 text-[32px] font-bold leading-tight text-violet-950">
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
        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-violet-50 p-1">
          <Button
            type="button"
            onClick={() => handleModeChange("sign-in")}
            variant="ghost"
            className={`min-h-11 rounded-xl font-bold ${
              isSignInMode
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-600 hover:text-violet-700"
            }`}>
            Entrar
          </Button>

          <Button
            type="button"
            onClick={() => handleModeChange("sign-up")}
            variant="ghost"
            className={`min-h-11 rounded-xl font-bold ${
              isSignUpMode
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-600 hover:text-violet-700"
            }`}>
            Criar conta
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        {isSignUpMode && (
          <FormField label="Nome completo">
            <Input
              className="focus:border-violet-700 focus:ring-3 focus:ring-violet-100"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Maria Silva"
              autoComplete="name"
              required
            />
          </FormField>
        )}

        <FormField label="E-mail">
          <Input
            className="focus:border-violet-700 focus:ring-3 focus:ring-violet-100"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seuemail@exemplo.com"
            autoComplete="email"
            required
          />
        </FormField>

        {!isResetPasswordMode && (
          <FormField label="Senha">
            <Input
              className="focus:border-violet-700 focus:ring-3 focus:ring-violet-100"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              autoComplete={isSignUpMode ? "new-password" : "current-password"}
              required
            />
          </FormField>
        )}

        {isSignUpMode && (
          <FormField label="Confirmar senha">
            <Input
              className="focus:border-violet-700 focus:ring-3 focus:ring-violet-100"
              type="password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              placeholder="Digite a senha novamente"
              autoComplete="new-password"
              required
            />
          </FormField>
        )}

        {(localError || error) && (
          <Alert tone="error">{localError || error}</Alert>
        )}

        {successMessage && <Alert tone="success">{successMessage}</Alert>}

        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="border-violet-700 bg-violet-700 hover:bg-violet-800">
          {isSubmitting && "Aguarde..."}
          {!isSubmitting && isSignInMode && "Entrar"}
          {!isSubmitting && isSignUpMode && "Criar conta"}
          {!isSubmitting && isResetPasswordMode && "Enviar e-mail"}
        </Button>
      </form>

      {isSignInMode && (
        <Button
          type="button"
          onClick={() => handleModeChange("reset-password")}
          fullWidth
          variant="ghost"
          className="mt-4 text-violet-700 hover:bg-violet-50 hover:text-violet-800">
          Esqueci minha senha
        </Button>
      )}

      {isResetPasswordMode && (
        <Button
          type="button"
          onClick={() => handleModeChange("sign-in")}
          fullWidth
          variant="ghost"
          className="mt-4 text-violet-700 hover:bg-violet-50 hover:text-violet-800">
          Voltar para o login
        </Button>
      )}
    </section>
  );
}
