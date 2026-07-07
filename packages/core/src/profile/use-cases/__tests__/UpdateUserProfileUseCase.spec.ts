import { describe, expect, it } from "vitest";

import { InMemoryUserProfileRepository } from "../../in-memory/InMemoryUserProfileRepository";
import { UpdateUserProfileUseCase } from "../UpdateUserProfileUseCase";

describe("UpdateUserProfileUseCase", () => {
  it("should create user profile when it does not exist", async () => {
    const userProfileRepository = new InMemoryUserProfileRepository();
    const updateUserProfileUseCase = new UpdateUserProfileUseCase(
      userProfileRepository,
    );

    const { profile } = await updateUserProfileUseCase.execute({
      userId: "user-1",
      email: "user@example.com",
      name: "Romualdo",
    });

    expect(profile.userId).toBe("user-1");
    expect(profile.email).toBe("user@example.com");
    expect(profile.name).toBe("Romualdo");
    expect(profile.createdAt).toBeInstanceOf(Date);
    expect(profile.updatedAt).toBeInstanceOf(Date);
  });

  it("should update user profile partially", async () => {
    const userProfileRepository = new InMemoryUserProfileRepository();

    await userProfileRepository.save({
      userId: "user-1",
      name: "Romualdo",
      email: "romualdo@example.com",
      phone: "11999999999",
      birthDate: "1990-01-01",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    });

    const updateUserProfileUseCase = new UpdateUserProfileUseCase(
      userProfileRepository,
    );

    const { profile } = await updateUserProfileUseCase.execute({
      userId: "user-1",
      email: "romualdo@example.com",
      name: "Romualdo Borges",
    });

    expect(profile.name).toBe("Romualdo Borges");
    expect(profile.phone).toBe("11999999999");
    expect(profile.birthDate).toBe("1990-01-01");
    expect(profile.createdAt).toEqual(new Date("2026-01-01"));
    expect(profile.updatedAt).toBeInstanceOf(Date);
  });

  it("should update email from authenticated user", async () => {
    const userProfileRepository = new InMemoryUserProfileRepository();

    await userProfileRepository.save({
      userId: "user-1",
      name: "Romualdo",
      email: "old@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const updateUserProfileUseCase = new UpdateUserProfileUseCase(
      userProfileRepository,
    );

    const { profile } = await updateUserProfileUseCase.execute({
      userId: "user-1",
      email: "new@example.com",
    });

    expect(profile.email).toBe("new@example.com");
  });

  it("should not allow empty user id", async () => {
    const userProfileRepository = new InMemoryUserProfileRepository();
    const updateUserProfileUseCase = new UpdateUserProfileUseCase(
      userProfileRepository,
    );

    await expect(() =>
      updateUserProfileUseCase.execute({
        userId: "",
        email: "user@example.com",
        name: "Romualdo",
      }),
    ).rejects.toThrow("Usuário é obrigatório.");
  });
});
