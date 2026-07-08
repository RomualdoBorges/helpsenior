import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryTaskRepository } from "../../in-memory/InMemoryTaskRepository";
import { CompleteTaskUseCase } from "../CompleteTaskUseCase";
import { CreateTaskUseCase } from "../CreateTaskUseCase";

describe("CompleteTaskUseCase", () => {
  let taskRepository: InMemoryTaskRepository;
  let createTaskUseCase: CreateTaskUseCase;
  let completeTaskUseCase: CompleteTaskUseCase;

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository();
    createTaskUseCase = new CreateTaskUseCase(taskRepository);
    completeTaskUseCase = new CompleteTaskUseCase(taskRepository);
  });

  it("should complete a task", async () => {
    const { task } = await createTaskUseCase.execute({
      userId: "user-1",
      title: "Tomar água",
      description: "Beber um copo de água.",
      date: "2026-07-10",
    });

    const result = await completeTaskUseCase.execute({
      taskId: task.id,
    });

    const updatedTask = await taskRepository.findById(task.id);
    const tasks = await taskRepository.listByUserId("user-1");

    expect(result.task.id).toBe(task.id);
    expect(result.task.completed).toBe(true);
    expect(result.task.status).toBe("completed");
    expect(result.task.completedAt).toBeInstanceOf(Date);
    expect(result.task.updatedAt).toBeInstanceOf(Date);

    expect(updatedTask?.completed).toBe(true);
    expect(updatedTask?.status).toBe("completed");
    expect(updatedTask?.completedAt).toBeInstanceOf(Date);

    expect(tasks).toHaveLength(1);
  });

  it("should complete all steps when completing a task", async () => {
    const { task } = await createTaskUseCase.execute({
      userId: "user-1",
      title: "Tomar remédio",
      steps: [
        {
          title: "Pegar o remédio",
        },
        {
          title: "Tomar com água",
        },
      ],
    });

    const result = await completeTaskUseCase.execute({
      taskId: task.id,
    });

    expect(result.task.completed).toBe(true);
    expect(result.task.status).toBe("completed");
    expect(result.task.steps).toHaveLength(2);

    expect(result.task.steps[0]?.completed).toBe(true);
    expect(result.task.steps[0]?.completedAt).toBeInstanceOf(Date);

    expect(result.task.steps[1]?.completed).toBe(true);
    expect(result.task.steps[1]?.completedAt).toBeInstanceOf(Date);
  });

  it("should return the task when it is already completed", async () => {
    const { task } = await createTaskUseCase.execute({
      userId: "user-1",
      title: "Tomar água",
    });

    await completeTaskUseCase.execute({
      taskId: task.id,
    });

    const result = await completeTaskUseCase.execute({
      taskId: task.id,
    });

    const tasks = await taskRepository.listByUserId("user-1");

    expect(result.task.id).toBe(task.id);
    expect(result.task.completed).toBe(true);
    expect(result.task.status).toBe("completed");
    expect(tasks).toHaveLength(1);
  });

  it("should not complete a task without taskId", async () => {
    await expect(
      completeTaskUseCase.execute({
        taskId: "",
      }),
    ).rejects.toThrow("Tarefa é obrigatória.");
  });

  it("should not complete a task that does not exist", async () => {
    await expect(
      completeTaskUseCase.execute({
        taskId: "task-1",
      }),
    ).rejects.toThrow("Tarefa não encontrada.");
  });
});