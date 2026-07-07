import { describe, expect, it } from "vitest";

import { InMemoryUserPreferencesRepository } from "../../in-memory/InMemoryUserPreferencesRepository";
import { UpdateUserPreferencesUseCase } from "../UpdateUserPreferencesUseCase";

describe("UpdateUserPreferencesUseCase", () => {
  it("should create preferences when user has no preferences yet", async () => {
    const userPreferencesRepository = new InMemoryUserPreferencesRepository();

    const updateUserPreferencesUseCase = new UpdateUserPreferencesUseCase(
      userPreferencesRepository,
    );

    const { preferences } = await updateUserPreferencesUseCase.execute({
      userId: "user-1",
      fontSize: "large",
      contrast: "high",
      simpleMode: true,
      reduceMotion: true,
      increasedSpacing: true,
    });

    expect(preferences.userId).toBe("user-1");
    expect(preferences.fontSize).toBe("large");
    expect(preferences.contrast).toBe("high");
    expect(preferences.simpleMode).toBe(true);
    expect(preferences.reduceMotion).toBe(true);
    expect(preferences.increasedSpacing).toBe(true);
    expect(preferences.updatedAt).toBeInstanceOf(Date);
  });

  it("should update existing preferences partially", async () => {
    const userPreferencesRepository = new InMemoryUserPreferencesRepository();

    const updateUserPreferencesUseCase = new UpdateUserPreferencesUseCase(
      userPreferencesRepository,
    );

    await userPreferencesRepository.save({
      userId: "user-1",
      fontSize: "medium",
      contrast: "default",
      simpleMode: false,
      reduceMotion: false,
      increasedSpacing: false,
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const { preferences } = await updateUserPreferencesUseCase.execute({
      userId: "user-1",
      fontSize: "extra_large",
      simpleMode: true,
    });

    expect(preferences.userId).toBe("user-1");
    expect(preferences.fontSize).toBe("extra_large");
    expect(preferences.contrast).toBe("default");
    expect(preferences.simpleMode).toBe(true);
    expect(preferences.reduceMotion).toBe(false);
    expect(preferences.increasedSpacing).toBe(false);
    expect(preferences.updatedAt).toBeInstanceOf(Date);
  });

  it("should not update preferences without userId", async () => {
    const userPreferencesRepository = new InMemoryUserPreferencesRepository();

    const updateUserPreferencesUseCase = new UpdateUserPreferencesUseCase(
      userPreferencesRepository,
    );

    await expect(() =>
      updateUserPreferencesUseCase.execute({
        userId: "",
        fontSize: "large",
      }),
    ).rejects.toThrow("Usuário é obrigatório.");
  });
});
