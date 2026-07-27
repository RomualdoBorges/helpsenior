import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPendingUserProfileNameStorageKey,
  USER_PROFILE_UPDATED_EVENT,
  useAuth,
  type UserProfileUpdatedEventDetail,
} from "./useAuth";

const authMocks = vi.hoisted(() => ({
  getProfile: vi.fn(),
  onAuthStateChanged: vi.fn(),
  resetPassword: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  unsubscribe: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("../../../config/firebase", () => ({
  authService: {
    onAuthStateChanged: authMocks.onAuthStateChanged,
    resetPassword: authMocks.resetPassword,
    signIn: authMocks.signIn,
    signOut: authMocks.signOut,
    signUp: authMocks.signUp,
  },
  db: {},
}));

vi.mock("@helpsenior/firebase", () => ({
  FirebaseUserProfileRepository: class FirebaseUserProfileRepository {},
}));

vi.mock("@helpsenior/core", async (importOriginal) => {
  const original = await importOriginal<typeof import("@helpsenior/core")>();

  return {
    ...original,
    GetUserProfileUseCase: class GetUserProfileUseCase {
      execute = authMocks.getProfile;
    },
    UpdateUserProfileUseCase: class UpdateUserProfileUseCase {
      execute = authMocks.updateProfile;
    },
  };
});

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    authMocks.onAuthStateChanged.mockReturnValue(authMocks.unsubscribe);
    authMocks.getProfile.mockResolvedValue({});
    authMocks.updateProfile.mockResolvedValue({});
    authMocks.resetPassword.mockResolvedValue(undefined);
    authMocks.signOut.mockResolvedValue(undefined);
  });

  it("acompanha o estado de autenticação e remove o listener ao desmontar", () => {
    let authStateCallback: (user: {
      id: string;
      email: string | null;
    } | null) => void = () => undefined;
    authMocks.onAuthStateChanged.mockImplementation((callback) => {
      authStateCallback = callback;
      return authMocks.unsubscribe;
    });

    const { result, unmount } = renderHook(() => useAuth());
    expect(result.current.isLoadingAuth).toBe(true);

    act(() => {
      authStateCallback({ id: "user-1", email: "maria@example.com" });
    });
    expect(result.current.isLoadingAuth).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);

    unmount();
    expect(authMocks.unsubscribe).toHaveBeenCalledOnce();
  });

  it("autentica e encerra a sessão", async () => {
    const user = { id: "user-1", email: "maria@example.com" };
    authMocks.signIn.mockResolvedValue(user);
    const { result } = renderHook(() => useAuth());

    let signedIn = false;
    await act(async () => {
      signedIn = await result.current.signIn("maria@example.com", "senha123");
    });
    expect(signedIn).toBe(true);
    expect(result.current.user).toEqual(user);

    await act(async () => {
      await result.current.signOut();
    });
    expect(authMocks.signOut).toHaveBeenCalledOnce();
    expect(result.current.user).toBeNull();
  });

  it("traduz erros de login sem autenticar o usuário", async () => {
    authMocks.signIn.mockRejectedValue({
      code: "auth/invalid-credential",
    });
    const { result } = renderHook(() => useAuth());

    let signedIn = true;
    await act(async () => {
      signedIn = await result.current.signIn("maria@example.com", "errada");
    });

    expect(signedIn).toBe(false);
    expect(result.current.authError).toBe("E-mail ou senha incorretos.");
    expect(result.current.isSubmittingAuth).toBe(false);
  });

  it("cadastra o usuário, atualiza o perfil e publica o nome", async () => {
    const createdUser = { id: "user-1", email: "maria@example.com" };
    authMocks.signUp.mockResolvedValue(createdUser);
    const receivedEvents: UserProfileUpdatedEventDetail[] = [];
    const eventListener = (event: Event) => {
      receivedEvents.push(
        (event as CustomEvent<UserProfileUpdatedEventDetail>).detail,
      );
    };
    window.addEventListener(USER_PROFILE_UPDATED_EVENT, eventListener);
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp({
        name: "  Maria Silva  ",
        email: "maria@example.com",
        password: "senha123",
      });
    });
    window.removeEventListener(USER_PROFILE_UPDATED_EVENT, eventListener);

    expect(authMocks.signUp).toHaveBeenCalledWith(
      "maria@example.com",
      "senha123",
    );
    expect(authMocks.getProfile).toHaveBeenCalledWith({
      userId: "user-1",
      email: "maria@example.com",
    });
    expect(authMocks.updateProfile).toHaveBeenCalledWith({
      userId: "user-1",
      email: "maria@example.com",
      name: "Maria Silva",
    });
    expect(
      sessionStorage.getItem(getPendingUserProfileNameStorageKey("user-1")),
    ).toBe("Maria Silva");
    expect(receivedEvents).toEqual([
      {
        userId: "user-1",
        email: "maria@example.com",
        name: "Maria Silva",
      },
    ]);
  });

  it("envia a recuperação de senha e apresenta confirmação", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.resetPassword("maria@example.com");
    });

    expect(authMocks.resetPassword).toHaveBeenCalledWith("maria@example.com");
    expect(result.current.authSuccessMessage).toBe(
      "Enviamos um e-mail com as instruções para redefinir sua senha.",
    );
  });
});
