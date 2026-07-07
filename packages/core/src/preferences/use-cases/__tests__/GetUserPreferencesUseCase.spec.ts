import { describe, expect, it } from "vitest";

import { InMemoryUserPreferencesRepository } from "../../in-memory/InMemoryUserPreferencesRepository";
import { GetUserPreferencesUseCase } from "../GetUserPreferencesUseCase";

describe("GetUserPreferencesUseCase", () => {
  it("should create and return default preferences when user has no preferences", async () => {
    const userPreferencesRepository = new InMemoryUserPreferencesRepository();

    const getUserPreferencesUseCase = new GetUserPreferencesUseCase(
      userPreferencesRepository,
    );

    const { preferences } = await getUserPreferencesUseCase.execute({
      userId: "user-1",
    });

    expect(preferences.userId).toBe("user-1");
    expect(preferences.fontSize).toBe("medium");
    expect(preferences.contrast).toBe("default");
    expect(preferences.simpleMode).toBe(false);
    expect(preferences.reduceMotion).toBe(false);
    expect(preferences.increasedSpacing).toBe(false);
    expect(preferences.updatedAt).toBeInstanceOf(Date);
  });

  it("should return existing preferences when user already has preferences", async () => {
    const userPreferencesRepository = new InMemoryUserPreferencesRepository();

    const getUserPreferencesUseCase = new GetUserPreferencesUseCase(
      userPreferencesRepository,
    );

    await userPreferencesRepository.save({
      userId: "user-1",
      fontSize: "large",
      contrast: "high",
      simpleMode: true,
      reduceMotion: true,
      increasedSpacing: true,
      updatedAt: new Date(),
    });

    const { preferences } = await getUserPreferencesUseCase.execute({
      userId: "user-1",
    });

    expect(preferences.userId).toBe("user-1");
    expect(preferences.fontSize).toBe("large");
    expect(preferences.contrast).toBe("high");
    expect(preferences.simpleMode).toBe(true);
    expect(preferences.reduceMotion).toBe(true);
    expect(preferences.increasedSpacing).toBe(true);
  });

  it("should not get preferences without userId", async () => {
    const userPreferencesRepository = new InMemoryUserPreferencesRepository();

    const getUserPreferencesUseCase = new GetUserPreferencesUseCase(
      userPreferencesRepository,
    );

    await expect(() =>
      getUserPreferencesUseCase.execute({
        userId: "",
      }),
    ).rejects.toThrow("Usuário é obrigatório.");
  });
});
