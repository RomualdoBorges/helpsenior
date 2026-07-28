import { describe, expect, it } from "vitest";

import { InMemoryActivityRepository } from "../../in-memory/InMemoryActivityRepository";
import { CreateActivityUseCase } from "../CreateActivityUseCase";
import { ListActivitiesUseCase } from "../ListActivitiesUseCase";

describe("ListActivitiesUseCase", () => {
  it("should list activities by userId", async () => {
    const activityRepository = new InMemoryActivityRepository();

    const createActivityUseCase = new CreateActivityUseCase(activityRepository);
    const listActivitiesUseCase = new ListActivitiesUseCase(activityRepository);

    await createActivityUseCase.execute({
      userId: "user-1",
      title: "Tomar remédio",
      steps: [{ order: 1, description: "Tomar remédio com água" }],
    });

    await createActivityUseCase.execute({
      userId: "user-1",
      title: "Beber água",
      steps: [{ order: 1, description: "Beber água" }],
    });

    await createActivityUseCase.execute({
      userId: "user-2",
      title: "Caminhar",
      steps: [{ order: 1, description: "Caminhar" }],
    });

    const { activities } = await listActivitiesUseCase.execute({
      userId: "user-1",
    });

    expect(activities).toHaveLength(2);
    expect(activities[0]?.userId).toBe("user-1");
    expect(activities[1]?.userId).toBe("user-1");
  });

  it("should return an empty list when user has no activities", async () => {
    const activityRepository = new InMemoryActivityRepository();
    const listActivitiesUseCase = new ListActivitiesUseCase(activityRepository);

    const { activities } = await listActivitiesUseCase.execute({
      userId: "user-1",
    });

    expect(activities).toEqual([]);
  });

  it("should not list activities without userId", async () => {
    const activityRepository = new InMemoryActivityRepository();
    const listActivitiesUseCase = new ListActivitiesUseCase(activityRepository);

    await expect(() =>
      listActivitiesUseCase.execute({
        userId: "",
      }),
    ).rejects.toThrow("Usuário é obrigatório.");
  });
});
