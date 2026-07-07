import { describe, expect, it } from "vitest";

import { InMemoryTaskRepository } from "../../in-memory/InMemoryTaskRepository";
import { CreateTaskUseCase } from "../CreateTaskUseCase";

describe("CreateTaskUseCase", () => {
  it("should create a task", async () => {
    const taskRepository = new InMemoryTaskRepository();
    const createTaskUseCase = new CreateTaskUseCase(taskRepository);

    const { task } = await createTaskUseCase.execute({
      userId: "user-1",
      title: "Tomar remédio",
      description: "Tomar o remédio da pressão.",
    });

    expect(task.id).toEqual(expect.any(String));
    expect(task.userId).toBe("user-1");
    expect(task.title).toBe("Tomar remédio");
    expect(task.description).toBe("Tomar o remédio da pressão.");
    expect(task.status).toBe("pending");
    expect(task.steps).toHaveLength(0);
    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.updatedAt).toBeInstanceOf(Date);
    expect(task.completedAt).toBeUndefined();
  });

  it("should create a task with steps", async () => {
    const taskRepository = new InMemoryTaskRepository();
    const createTaskUseCase = new CreateTaskUseCase(taskRepository);

    const { task } = await createTaskUseCase.execute({
      userId: "user-1",
      title: "Preparar café",
      steps: [
        {
          title: "Pegar a garrafa",
        },
        {
          title: "Colocar água",
          description: "Usar água filtrada.",
        },
      ],
    });

    expect(task.steps).toHaveLength(2);

    expect(task.steps[0]).toEqual({
      id: expect.any(String),
      title: "Pegar a garrafa",
      description: undefined,
      completed: false,
      order: 1,
    });

    expect(task.steps[1]).toEqual({
      id: expect.any(String),
      title: "Colocar água",
      description: "Usar água filtrada.",
      completed: false,
      order: 2,
    });
  });

  it("should not create a task without userId", async () => {
    const taskRepository = new InMemoryTaskRepository();
    const createTaskUseCase = new CreateTaskUseCase(taskRepository);

    await expect(() =>
      createTaskUseCase.execute({
        userId: "",
        title: "Tomar remédio",
      }),
    ).rejects.toThrow("Usuário é obrigatório.");
  });

  it("should not create a task without title", async () => {
    const taskRepository = new InMemoryTaskRepository();
    const createTaskUseCase = new CreateTaskUseCase(taskRepository);

    await expect(() =>
      createTaskUseCase.execute({
        userId: "user-1",
        title: "",
      }),
    ).rejects.toThrow("Título da tarefa é obrigatório.");
  });
});
