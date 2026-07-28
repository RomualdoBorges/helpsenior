import type { Activity } from "../../entities/Activity";

import { describe, expect, it } from "vitest";

import { InMemoryActivityRepository } from "../../in-memory/InMemoryActivityRepository";
import { UpdateActivityUseCase } from "../UpdateActivityUseCase";

function createActivity(overrides?: Partial<Activity>): Activity {
  const now = new Date("2026-07-09T10:00:00.000Z");

  return {
    id: "activity-1",
    userId: "user-1",
    title: "Pagar conta",
    description: "Pagar conta de luz",
    steps: [{ order: 1, description: "Pagar conta de luz" }],
    resources: [{ description: "Conta de luz" }],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("UpdateActivityUseCase", () => {
  it("should update a activity", async () => {
    const repository = new InMemoryActivityRepository();
    const activity = createActivity();

    await repository.create(activity);

    const useCase = new UpdateActivityUseCase(repository);

    const result = await useCase.execute({
      activityId: activity.id,
      title: "Comprar remédio",
      description: "Comprar remédio na farmácia",
      steps: [{ order: 1, description: "Comprar remédio na farmácia" }],
    });

    expect(result.activity.title).toBe("Comprar remédio");
    expect(result.activity.description).toBe("Comprar remédio na farmácia");
    expect(result.activity.steps).toEqual([{ order: 1, description: "Comprar remédio na farmácia" }]);
    expect(result.activity.updatedAt.getTime()).toBeGreaterThan(
      activity.updatedAt.getTime(),
    );
  });

  it("should save the updated activity in the repository", async () => {
    const repository = new InMemoryActivityRepository();
    const activity = createActivity();

    await repository.create(activity);

    const useCase = new UpdateActivityUseCase(repository);

    await useCase.execute({
      activityId: activity.id,
      title: "Comprar remédio",
      description: "Comprar remédio na farmácia",
      steps: [{ order: 1, description: "Comprar remédio na farmácia" }],
    });

    const updatedActivity = await repository.findById(activity.id);

    expect(updatedActivity?.title).toBe("Comprar remédio");
    expect(updatedActivity?.description).toBe("Comprar remédio na farmácia");
    expect(updatedActivity?.steps).toEqual([{ order: 1, description: "Comprar remédio na farmácia" }]);
  });

  it("should trim title and description", async () => {
    const repository = new InMemoryActivityRepository();
    const activity = createActivity();

    await repository.create(activity);

    const useCase = new UpdateActivityUseCase(repository);

    const result = await useCase.execute({
      activityId: activity.id,
      title: "  Comprar remédio  ",
      description: "  Comprar remédio na farmácia  ",
      steps: [{ order: 1, description: "Comprar remédio na farmácia" }],
    });

    expect(result.activity.title).toBe("Comprar remédio");
    expect(result.activity.description).toBe("Comprar remédio na farmácia");
  });

  it("should remove description when it is empty", async () => {
    const repository = new InMemoryActivityRepository();
    const activity = createActivity();

    await repository.create(activity);

    const useCase = new UpdateActivityUseCase(repository);

    const result = await useCase.execute({
      activityId: activity.id,
      title: "Comprar remédio",
      description: "",
      steps: [{ order: 1, description: "Comprar remédio na farmácia" }],
    });

    expect(result.activity.description).toBeUndefined();
  });

  it("should remove resources when it is empty", async () => {
    const repository = new InMemoryActivityRepository();
    const activity = createActivity();

    await repository.create(activity);

    const useCase = new UpdateActivityUseCase(repository);

    const result = await useCase.execute({
      activityId: activity.id,
      title: "Comprar remédio",
      steps: [{ order: 1, description: "Comprar remédio na farmácia" }],
      resources: [],
    });

    expect(result.activity.resources).toBeUndefined();
  });

  it("should throw an error when activityId is empty", async () => {
    const repository = new InMemoryActivityRepository();
    const useCase = new UpdateActivityUseCase(repository);

    await expect(
      useCase.execute({
        activityId: "",
        title: "Comprar remédio",
        steps: [{ order: 1, description: "Comprar remédio na farmácia" }],
      }),
    ).rejects.toThrow("Atividade é obrigatória.");
  });

  it("should throw an error when title is empty", async () => {
    const repository = new InMemoryActivityRepository();
    const activity = createActivity();

    await repository.create(activity);

    const useCase = new UpdateActivityUseCase(repository);

    await expect(
      useCase.execute({
        activityId: activity.id,
        title: "",
        steps: [{ order: 1, description: "Comprar remédio na farmácia" }],
      }),
    ).rejects.toThrow("Título da atividade é obrigatório.");
  });

  it("should throw an error when steps is empty", async () => {
    const repository = new InMemoryActivityRepository();
    const activity = createActivity();

    await repository.create(activity);

    const useCase = new UpdateActivityUseCase(repository);

    await expect(
      useCase.execute({
        activityId: activity.id,
        title: "Comprar remédio",
        steps: [],
      }),
    ).rejects.toThrow("A atividade deve ter pelo menos um passo.");
  });

  it("should throw an error when activity does not exist", async () => {
    const repository = new InMemoryActivityRepository();
    const useCase = new UpdateActivityUseCase(repository);

    await expect(
      useCase.execute({
        activityId: "not-found",
        title: "Comprar remédio",
        steps: [{ order: 1, description: "Comprar remédio na farmácia" }],
      }),
    ).rejects.toThrow("Atividade não encontrada.");
  });
});