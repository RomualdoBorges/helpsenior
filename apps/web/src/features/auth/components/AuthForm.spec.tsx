import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthForm } from "./AuthForm";

function getSubmitButton(name: string) {
  const button = screen
    .getAllByRole("button", { name })
    .find((candidate) => candidate.getAttribute("type") === "submit");

  if (!button) {
    throw new Error(`Botão de envio "${name}" não encontrado.`);
  }

  return button;
}

function renderAuthForm(overrides: {
  isSubmitting?: boolean;
  error?: string | null;
  successMessage?: string | null;
  onSignIn?: (email: string, password: string) => Promise<void>;
  onSignUp?: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  onResetPassword?: (email: string) => Promise<void>;
} = {}) {
  const props = {
    isSubmitting: false,
    error: null,
    successMessage: null,
    onSignIn: vi.fn().mockResolvedValue(undefined),
    onSignUp: vi.fn().mockResolvedValue(undefined),
    onResetPassword: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };

  render(<AuthForm {...props} />);

  return props;
}

describe("AuthForm", () => {
  it("normaliza e envia as credenciais de login", async () => {
    const user = userEvent.setup();
    const props = renderAuthForm();

    await user.type(screen.getByLabelText("E-mail"), "  maria@example.com  ");
    await user.type(screen.getByLabelText("Senha"), "senha123");
    await user.click(getSubmitButton("Entrar"));

    expect(props.onSignIn).toHaveBeenCalledWith(
      "maria@example.com",
      "senha123",
    );
  });

  it("valida e-mail e senha antes do login", () => {
    const props = renderAuthForm();
    const submitButton = getSubmitButton("Entrar");
    const form = submitButton.closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form!);
    expect(screen.getByText("Informe seu e-mail.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "maria@example.com" },
    });
    fireEvent.submit(form!);
    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
    expect(props.onSignIn).not.toHaveBeenCalled();
  });

  it("valida a confirmação e envia o cadastro", async () => {
    const user = userEvent.setup();
    const props = renderAuthForm();
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await user.type(screen.getByLabelText("Nome completo"), "  Maria Silva  ");
    await user.type(screen.getByLabelText("E-mail"), " maria@example.com ");
    await user.type(screen.getByLabelText("Senha"), "senha123");
    await user.type(screen.getByLabelText("Confirmar senha"), "outraSenha");
    await user.click(getSubmitButton("Criar conta"));

    expect(screen.getByText("As senhas não conferem.")).toBeInTheDocument();
    expect(props.onSignUp).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText("Confirmar senha"));
    await user.type(screen.getByLabelText("Confirmar senha"), "senha123");
    await user.click(getSubmitButton("Criar conta"));

    expect(props.onSignUp).toHaveBeenCalledWith({
      name: "Maria Silva",
      email: "maria@example.com",
      password: "senha123",
    });
  });

  it("envia a recuperação de senha e permite voltar ao login", async () => {
    const user = userEvent.setup();
    const props = renderAuthForm();

    await user.click(
      screen.getByRole("button", { name: "Esqueci minha senha" }),
    );
    expect(
      screen.getByRole("heading", { name: "Recuperar senha" }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("E-mail"), " maria@example.com ");
    await user.click(screen.getByRole("button", { name: "Enviar e-mail" }));
    expect(props.onResetPassword).toHaveBeenCalledWith("maria@example.com");

    await user.click(
      screen.getByRole("button", { name: "Voltar para o login" }),
    );
    expect(
      screen.getByRole("heading", { name: "Entrar na conta" }),
    ).toBeInTheDocument();
  });

  it("apresenta mensagens e desabilita o envio durante uma operação", () => {
    renderAuthForm({
      isSubmitting: true,
      error: "Credenciais inválidas.",
      successMessage: "Mensagem enviada.",
    });

    expect(screen.getByText("Credenciais inválidas.")).toBeInTheDocument();
    expect(screen.getByText("Mensagem enviada.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aguarde..." })).toBeDisabled();
  });
});
