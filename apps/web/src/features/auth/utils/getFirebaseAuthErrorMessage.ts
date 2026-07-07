interface FirebaseLikeError {
  code?: string;
  message?: string;
}

function isFirebaseLikeError(error: unknown): error is FirebaseLikeError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function getFirebaseAuthErrorMessage(error: unknown) {
  if (!isFirebaseLikeError(error)) {
    return "Não foi possível concluir a ação. Tente novamente.";
  }

  const errorMessages: Record<string, string> = {
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/invalid-email": "Informe um e-mail válido.",
    "auth/user-not-found": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/missing-password": "Informe a senha.",
    "auth/missing-email": "Informe o e-mail.",
    "auth/too-many-requests":
      "Muitas tentativas foram feitas. Aguarde alguns minutos e tente novamente.",
    "auth/network-request-failed":
      "Não foi possível conectar. Verifique sua internet e tente novamente.",
    "auth/popup-closed-by-user": "A janela de autenticação foi fechada.",
    "auth/requires-recent-login":
      "Por segurança, faça login novamente para continuar.",
  };

  return (
    errorMessages[error.code ?? ""] ??
    "Não foi possível concluir a ação. Tente novamente."
  );
}
