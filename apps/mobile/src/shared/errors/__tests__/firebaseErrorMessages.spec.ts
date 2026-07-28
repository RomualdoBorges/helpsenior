import { describe, expect, it } from "vitest";

import { getFirebaseAuthErrorMessage } from "../../../features/auth/getFirebaseAuthErrorMessage";
import { getFirebaseFirestoreErrorMessage } from "../getFirebaseFirestoreErrorMessage";

describe("mensagens de erro do Firebase", () => {
  it("traduz erros conhecidos de autenticação", () => {
    expect(
      getFirebaseAuthErrorMessage({ code: "auth/email-already-in-use" }),
    ).toBe("Este e-mail já está cadastrado.");
    expect(
      getFirebaseAuthErrorMessage({ code: "auth/network-request-failed" }),
    ).toContain("Verifique sua internet");
  });

  it("não expõe erros desconhecidos de autenticação", () => {
    expect(getFirebaseAuthErrorMessage(new Error("internal details"))).toBe(
      "Não foi possível concluir a ação. Tente novamente.",
    );
  });

  it("traduz erros conhecidos do Firestore", () => {
    expect(
      getFirebaseFirestoreErrorMessage(
        { code: "permission-denied" },
        "Mensagem alternativa.",
      ),
    ).toBe("Você não tem permissão para acessar essas informações.");
  });

  it("usa a mensagem alternativa para erros desconhecidos", () => {
    expect(
      getFirebaseFirestoreErrorMessage(
        { code: "custom-error" },
        "Mensagem alternativa.",
      ),
    ).toBe("Mensagem alternativa.");
  });
});
