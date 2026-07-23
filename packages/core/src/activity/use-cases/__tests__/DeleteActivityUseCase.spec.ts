import type { Activity } from "../../entities/Activity";

import { describe, expect, it } from "vitest";

import { InMemoryActivityRepository } from "../../in-memory/InMemoryActivityRepository";
import { DeleteActivityUseCase } from "../DeleteActivityUseCase";

function createActivity(overrides?: Partial<Activity>): Activity {
  const now = new Date();

  return {
    id: "task-1",
    userId: "user-1",
    title: "Pagar conta",
    createdAt: now,
    updatedAt: now,
    steps: [],
    ...overrides,
  };
}

describe("DeleteActivityUseCase", () => {
  it("should delete an activity", async () => {
    const repository = new InMemoryActivityRepository();
    const activity = createActivity();

    await repository.create(activity);

    const useCase = new DeleteActivityUseCase(repository);

    await useCase.execute({
      activityId: activity.id,
    });

    const deletedActivity = await repository.findById(activity.id);

    expect(deletedActivity).toBeNull();
  });

  it("should not delete other activities", async () => {
    const repository = new InMemoryActivityRepository();

    const activityToDelete = createActivity({
      id: "activity-1",
      title: "Pagar conta",
    });

    const activityToKeep = createActivity({
      id: "activity-2",
      title: "Comprar pão",
    });

    await repository.create(activityToDelete);
    await repository.create(activityToKeep);

    const useCase = new DeleteActivityUseCase(repository);

    await useCase.execute({
      activityId: activityToDelete.id,
    });

    const deletedActivity = await repository.findById(activityToDelete.id);
    const keptActivity = await repository.findById(activityToKeep.id);

    expect(deletedActivity).toBeNull();
    expect(keptActivity).toEqual(activityToKeep);
  });

  it("should throw an error when activityId is empty", async () => {
    const repository = new InMemoryActivityRepository();
    const useCase = new DeleteActivityUseCase(repository);

    await expect(
      useCase.execute({
        activityId: "",
      }),
    ).rejects.toThrow("Atividade é obrigatória.");
  });

  it("should throw an error when activity does not exist", async () => {
    const repository = new InMemoryActivityRepository();
    const useCase = new DeleteActivityUseCase(repository);

    await expect(
      useCase.execute({
        activityId: "not-found",
      }),
    ).rejects.toThrow("Atividade não encontrada.");
  });
});
