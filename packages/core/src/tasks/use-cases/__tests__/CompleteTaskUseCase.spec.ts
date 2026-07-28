import type { Task } from "../../entities/Task";

import { describe, expect, it } from "vitest";

import { InMemoryTaskRepository } from "../../in-memory/InMemoryTaskRepository";
import { CompleteTaskUseCase } from "../CompleteTaskUseCase";

function createTask(overrides?: Partial<Task>): Task {
  const now = new Date();

  return {
    id: "task-1",
    userId: "user-1",
    title: "Tomar remédio",
    status: "pending",
    completed: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("CompleteTaskUseCase", () => {
  it("should complete a task", async () => {
    const repository = new InMemoryTaskRepository();
    const task = createTask();

    await repository.create(task);

    const useCase = new CompleteTaskUseCase(repository);

    const result = await useCase.execute({
      taskId: task.id,
    });

    expect(result.task.completed).toBe(true);
    expect(result.task.status).toBe("completed");
    expect(result.task.completedAt).toBeInstanceOf(Date);
    expect(result.task.updatedAt.getTime()).toBeGreaterThanOrEqual(
      task.updatedAt.getTime(),
    );
  });

  it("should save the completed task in repository", async () => {
    const repository = new InMemoryTaskRepository();
    const task = createTask();

    await repository.create(task);

    const useCase = new CompleteTaskUseCase(repository);

    const result = await useCase.execute({
      taskId: task.id,
    });

    const savedTask = await repository.findById(task.id);

    expect(savedTask).toEqual(result.task);
  });

  it("should keep a completed task unchanged when completed again", async () => {
    const completedAt = new Date("2026-07-10T10:00:00.000Z");
    const updatedAt = new Date("2026-07-10T10:00:00.000Z");

    const repository = new InMemoryTaskRepository();
    const task = createTask({
      status: "completed",
      completed: true,
      completedAt,
      updatedAt,
    });

    await repository.create(task);

    const useCase = new CompleteTaskUseCase(repository);

    const result = await useCase.execute({
      taskId: task.id,
    });

    expect(result.task).toEqual(task);
  });

  it("should preserve task date when completing", async () => {
    const repository = new InMemoryTaskRepository();
    const task = createTask({
      date: "2026-07-10",
    });

    await repository.create(task);

    const useCase = new CompleteTaskUseCase(repository);

    const result = await useCase.execute({
      taskId: task.id,
    });

    expect(result.task.date).toBe("2026-07-10");
  });

  it("should throw an error when taskId is empty", async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new CompleteTaskUseCase(repository);

    await expect(
      useCase.execute({
        taskId: "",
      }),
    ).rejects.toThrow("Tarefa é obrigatória.");
  });

  it("should throw an error when task does not exist", async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new CompleteTaskUseCase(repository);

    await expect(
      useCase.execute({
        taskId: "not-found",
      }),
    ).rejects.toThrow("Tarefa não encontrada.");
  });
});