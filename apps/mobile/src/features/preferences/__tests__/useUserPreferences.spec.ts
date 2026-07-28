import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createDefaultUserPreferences,
  type UserPreferences,
} from "@helpsenior/core";

import { useUserPreferences } from "../useUserPreferences";

const useCaseMocks = vi.hoisted(() => ({
  get: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@helpsenior/firebase", () => ({
  FirebaseUserPreferencesRepository:
    class FirebaseUserPreferencesRepository {},
}));

vi.mock("@helpsenior/core", async (importOriginal) => {
  const original = await importOriginal<typeof import("@helpsenior/core")>();

  return {
    ...original,
    GetUserPreferencesUseCase: class GetUserPreferencesUseCase {
      execute = useCaseMocks.get;
    },
    UpdateUserPreferencesUseCase: class UpdateUserPreferencesUseCase {
      execute = useCaseMocks.update;
    },
  };
});

vi.mock("@/src/config/firebase", () => ({ db: {} }));

function createPreferences(
  input: Partial<UserPreferences> = {},
): UserPreferences {
  return {
    ...createDefaultUserPreferences("user-1"),
    ...input,
  };
}

describe("useUserPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const preferences = createPreferences();
    useCaseMocks.get.mockResolvedValue({ preferences });
    useCaseMocks.update.mockResolvedValue({ preferences });
  });

  it("carrega as preferências do usuário", async () => {
    const { result } = renderHook(() => useUserPreferences("user-1"));

    await waitFor(() => expect(result.current.preferences).not.toBeNull());

    expect(result.current.preferences?.fontSize).toBe("medium");
    expect(useCaseMocks.get).toHaveBeenCalledWith({ userId: "user-1" });
  });

  it("aplica a atualização otimista e confirma o resultado salvo", async () => {
    const savedPreferences = createPreferences({ reduceMotion: true });
    useCaseMocks.update.mockResolvedValue({
      preferences: savedPreferences,
    });
    const { result } = renderHook(() => useUserPreferences("user-1"));
    await waitFor(() => expect(result.current.preferences).not.toBeNull());

    await act(async () => {
      await result.current.updatePreferences({ reduceMotion: true });
    });

    expect(useCaseMocks.update).toHaveBeenCalledWith({
      userId: "user-1",
      reduceMotion: true,
    });
    expect(result.current.preferences?.reduceMotion).toBe(true);
    expect(result.current.isUpdating).toBe(false);
  });

  it("restaura as preferências anteriores quando a gravação falha", async () => {
    useCaseMocks.update.mockRejectedValue({ code: "unavailable" });
    const { result } = renderHook(() => useUserPreferences("user-1"));
    await waitFor(() => expect(result.current.preferences).not.toBeNull());

    await act(async () => {
      await result.current.updatePreferences({ contrast: "high" });
    });

    expect(result.current.preferences?.contrast).toBe("default");
    expect(result.current.error).toContain("Verifique sua internet");
    expect(result.current.isUpdating).toBe(false);
  });

  it("não carrega nem atualiza preferências sem usuário", async () => {
    const { result } = renderHook(() => useUserPreferences(null));

    await act(async () => {
      await result.current.updatePreferences({ simpleMode: true });
    });

    expect(result.current.preferences).toBeNull();
    expect(useCaseMocks.get).not.toHaveBeenCalled();
    expect(useCaseMocks.update).not.toHaveBeenCalled();
  });
});
