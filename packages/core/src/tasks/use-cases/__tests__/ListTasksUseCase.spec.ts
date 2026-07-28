import { describe, expect, it } from "vitest";

import { InMemoryTaskRepository } from "../../in-memory/InMemoryTaskRepository";
import { CreateTaskUseCase } from "../CreateTaskUseCase";
import { ListTasksUseCase } from "../ListTasksUseCase";

describe("ListTasksUseCase", () => {
  it("should list tasks by userId", async () => {
    const taskRepository = new InMemoryTaskRepository();

    const createTaskUseCase = new CreateTaskUseCase(taskRepository);
    const listTasksUseCase = new ListTasksUseCase(taskRepository);

    await createTaskUseCase.execute({
      userId: "user-1",
      title: "Tomar remédio",
    });

    await createTaskUseCase.execute({
      userId: "user-1",
      title: "Beber água",
    });

    await createTaskUseCase.execute({
      userId: "user-2",
      title: "Caminhar",
    });

    const { tasks } = await listTasksUseCase.execute({
      userId: "user-1",
    });

    expect(tasks).toHaveLength(2);
    expect(tasks[0]?.userId).toBe("user-1");
    expect(tasks[1]?.userId).toBe("user-1");
  });

  it("should return an empty list when user has no tasks", async () => {
    const taskRepository = new InMemoryTaskRepository();
    const listTasksUseCase = new ListTasksUseCase(taskRepository);

    const { tasks } = await listTasksUseCase.execute({
      userId: "user-1",
    });

    expect(tasks).toEqual([]);
  });

  it("should not list tasks without userId", async () => {
    const taskRepository = new InMemoryTaskRepository();
    const listTasksUseCase = new ListTasksUseCase(taskRepository);

    await expect(() =>
      listTasksUseCase.execute({
        userId: "",
      }),
    ).rejects.toThrow("Usuário é obrigatório.");
  });
});
