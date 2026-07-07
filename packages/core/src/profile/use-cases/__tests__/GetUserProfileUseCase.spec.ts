import { describe, expect, it } from "vitest";

import { InMemoryUserProfileRepository } from "../../in-memory/InMemoryUserProfileRepository";
import { GetUserProfileUseCase } from "../GetUserProfileUseCase";

describe("GetUserProfileUseCase", () => {
  it("should create default user profile when it does not exist", async () => {
    const userProfileRepository = new InMemoryUserProfileRepository();
    const getUserProfileUseCase = new GetUserProfileUseCase(
      userProfileRepository,
    );

    const { profile } = await getUserProfileUseCase.execute({
      userId: "user-1",
      email: "user@example.com",
    });

    expect(profile.userId).toBe("user-1");
    expect(profile.email).toBe("user@example.com");
    expect(profile.name).toBe("");
    expect(profile.createdAt).toBeInstanceOf(Date);
    expect(profile.updatedAt).toBeInstanceOf(Date);
  });

  it("should return existing user profile", async () => {
    const userProfileRepository = new InMemoryUserProfileRepository();

    await userProfileRepository.save({
      userId: "user-1",
      name: "Romualdo",
      email: "romualdo@example.com",
      phone: "11999999999",
      birthDate: "1990-01-01",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const getUserProfileUseCase = new GetUserProfileUseCase(
      userProfileRepository,
    );

    const { profile } = await getUserProfileUseCase.execute({
      userId: "user-1",
      email: "romualdo@example.com",
    });

    expect(profile.name).toBe("Romualdo");
    expect(profile.phone).toBe("11999999999");
    expect(profile.birthDate).toBe("1990-01-01");
  });

  it("should not allow empty user id", async () => {
    const userProfileRepository = new InMemoryUserProfileRepository();
    const getUserProfileUseCase = new GetUserProfileUseCase(
      userProfileRepository,
    );

    await expect(() =>
      getUserProfileUseCase.execute({
        userId: "",
        email: "user@example.com",
      }),
    ).rejects.toThrow("Usuário é obrigatório.");
  });
});
