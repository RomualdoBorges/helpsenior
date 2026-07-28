import type { UserPreferences } from "@helpsenior/core";
import { describe, expect, it } from "vitest";
import { getFirebaseAuthErrorMessage } from "../../features/auth/utils/getFirebaseAuthErrorMessage";
import { getPreferenceClassNames } from "../../features/preferences/utils/getPreferenceClassNames";
import { getFirebaseFirestoreErrorMessage } from "../errors/getFirebaseFirestoreErrorMessage";
import { formatDisplayDate } from "./formatDisplayDate";

describe("formatDisplayDate", () => {
  it("formata uma data ISO curta para exibição em português", () => {
    expect(formatDisplayDate("2026-07-03")).toBe("03 jul. 2026");
  });

  it("mantém o valor original quando o mês é inválido", () => {
    expect(formatDisplayDate("2026-13-03")).toBe("2026-13-03");
  });
});

describe("getPreferenceClassNames", () => {
  it("não cria classes sem preferências", () => {
    expect(getPreferenceClassNames(null)).toBe("");
  });

  it("cria somente as classes correspondentes às preferências ativas", () => {
    const preferences: UserPreferences = {
      userId: "user-1",
      fontSize: "extra_large",
      contrast: "high",
      simpleMode: true,
      reduceMotion: true,
      increasedSpacing: false,
      updatedAt: new Date("2026-01-01T10:00:00"),
    };

    expect(getPreferenceClassNames(preferences)).toBe(
      "font-size-extra_large high-contrast simple-mode reduce-motion",
    );
  });
});

describe("Firebase error messages", () => {
  it("traduz códigos conhecidos de autenticação", () => {
    expect(
      getFirebaseAuthErrorMessage({ code: "auth/invalid-credential" }),
    ).toBe("E-mail ou senha incorretos.");
  });

  it("usa uma mensagem segura para erro desconhecido de autenticação", () => {
    expect(getFirebaseAuthErrorMessage(new Error("sensitive detail"))).toBe(
      "Não foi possível concluir a ação. Tente novamente.",
    );
  });

  it("traduz códigos conhecidos do Firestore", () => {
    expect(
      getFirebaseFirestoreErrorMessage(
        { code: "permission-denied" },
        "Falha ao carregar.",
      ),
    ).toBe("Você não tem permissão para acessar essas informações.");
  });

  it("usa o fallback para código desconhecido do Firestore", () => {
    expect(
      getFirebaseFirestoreErrorMessage(
        { code: "new-error-code" },
        "Falha ao carregar.",
      ),
    ).toBe("Falha ao carregar.");
  });
});
