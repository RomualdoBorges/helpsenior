interface FirebaseLikeError {
  code?: string;
  message?: string;
}

function isFirebaseLikeError(error: unknown): error is FirebaseLikeError {
  return typeof error === "object" && error !== null && "code" in error;
}

export function getFirebaseFirestoreErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (!isFirebaseLikeError(error)) {
    return fallbackMessage;
  }

  const errorMessages: Record<string, string> = {
    "permission-denied":
      "Você não tem permissão para acessar essas informações.",
    unauthenticated: "Sua sessão expirou. Faça login novamente.",
    unavailable:
      "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
    "deadline-exceeded":
      "A conexão demorou mais que o esperado. Tente novamente.",
    "resource-exhausted":
      "O serviço está temporariamente sobrecarregado. Tente novamente em alguns minutos.",
    cancelled: "A operação foi cancelada. Tente novamente.",
    unknown: "Ocorreu um erro inesperado. Tente novamente.",
    internal: "Ocorreu um erro interno. Tente novamente.",
    aborted: "A operação foi interrompida. Tente novamente.",
    "already-exists": "Esse registro já existe.",
    "not-found": "O registro solicitado não foi encontrado.",
    "invalid-argument": "Alguma informação enviada está inválida.",
    "failed-precondition": "Não foi possível concluir a ação no estado atual.",
    "data-loss": "Houve uma falha ao processar os dados.",
    "out-of-range": "Alguma informação enviada está fora do limite permitido.",
    unimplemented: "Essa operação ainda não está disponível.",
  };

  return errorMessages[error.code ?? ""] ?? fallbackMessage;
}
