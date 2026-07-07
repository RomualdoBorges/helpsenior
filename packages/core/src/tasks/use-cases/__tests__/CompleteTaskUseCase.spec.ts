import { describe, expect, it } from "vitest";

import { InMemoryTaskRepository } from "../../in-memory/InMemoryTaskRepository";
import { CompleteTaskUseCase } from "../CompleteTaskUseCase";
import { CreateTaskUseCase } from "../CreateTaskUseCase";

describe("CompleteTaskUseCase", () => {
  it("should complete a task", async () => {
    const taskRepository = new InMemoryTaskRepository();

    const createTaskUseCase = new CreateTaskUseCase(taskRepository);
    const completeTaskUseCase = new CompleteTaskUseCase(taskRepository);

    const { task } = await createTaskUseCase.execute({
      userId: "user-1",
      title: "Tomar remédio",
    });

    await completeTaskUseCase.execute({
      taskId: task.id,
    });

    const completedTask = await taskRepository.findById(task.id);

    expect(completedTask).not.toBeNull();
    expect(completedTask?.status).toBe("completed");
    expect(completedTask?.completedAt).toBeInstanceOf(Date);
    expect(completedTask?.updatedAt).toBeInstanceOf(Date);
  });

  it("should complete all task steps when completing a task", async () => {
    const taskRepository = new InMemoryTaskRepository();

    const createTaskUseCase = new CreateTaskUseCase(taskRepository);
    const completeTaskUseCase = new CompleteTaskUseCase(taskRepository);

    const { task } = await createTaskUseCase.execute({
      userId: "user-1",
      title: "Preparar café",
      steps: [
        {
          title: "Pegar a garrafa",
        },
        {
          title: "Colocar água",
        },
      ],
    });

    await completeTaskUseCase.execute({
      taskId: task.id,
    });

    const completedTask = await taskRepository.findById(task.id);

    expect(completedTask?.steps).toHaveLength(2);
    expect(completedTask?.steps.every((step) => step.completed)).toBe(true);
  });

  it("should not complete a task without taskId", async () => {
    const taskRepository = new InMemoryTaskRepository();
    const completeTaskUseCase = new CompleteTaskUseCase(taskRepository);

    await expect(() =>
      completeTaskUseCase.execute({
        taskId: "",
      }),
    ).rejects.toThrow("Tarefa é obrigatória.");
  });

  it("should not complete a task that does not exist", async () => {
    const taskRepository = new InMemoryTaskRepository();
    const completeTaskUseCase = new CompleteTaskUseCase(taskRepository);

    await expect(() =>
      completeTaskUseCase.execute({
        taskId: "invalid-task-id",
      }),
    ).rejects.toThrow("Tarefa não encontrada.");
  });
});
