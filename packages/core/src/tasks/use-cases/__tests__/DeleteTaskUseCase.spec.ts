import type { Task } from "../../entities/Task";

import { describe, expect, it } from "vitest";

import { InMemoryTaskRepository } from "../../in-memory/InMemoryTaskRepository";
import { DeleteTaskUseCase } from "../DeleteTaskUseCase";

function createTask(overrides?: Partial<Task>): Task {
  const now = new Date();

  return {
    id: "task-1",
    userId: "user-1",
    title: "Pagar conta",
    status: "pending",
    completed: false,
    date: "2026-07-10",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("DeleteTaskUseCase", () => {
  it("should delete a task", async () => {
    const repository = new InMemoryTaskRepository();
    const task = createTask();

    await repository.create(task);

    const useCase = new DeleteTaskUseCase(repository);

    await useCase.execute({
      taskId: task.id,
    });

    const deletedTask = await repository.findById(task.id);

    expect(deletedTask).toBeNull();
  });

  it("should not delete other tasks", async () => {
    const repository = new InMemoryTaskRepository();

    const taskToDelete = createTask({
      id: "task-1",
      title: "Pagar conta",
    });

    const taskToKeep = createTask({
      id: "task-2",
      title: "Comprar pão",
    });

    await repository.create(taskToDelete);
    await repository.create(taskToKeep);

    const useCase = new DeleteTaskUseCase(repository);

    await useCase.execute({
      taskId: taskToDelete.id,
    });

    const deletedTask = await repository.findById(taskToDelete.id);
    const keptTask = await repository.findById(taskToKeep.id);

    expect(deletedTask).toBeNull();
    expect(keptTask).toEqual(taskToKeep);
  });

  it("should throw an error when taskId is empty", async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new DeleteTaskUseCase(repository);

    await expect(
      useCase.execute({
        taskId: "",
      }),
    ).rejects.toThrow("Tarefa é obrigatória.");
  });

  it("should throw an error when task does not exist", async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new DeleteTaskUseCase(repository);

    await expect(
      useCase.execute({
        taskId: "not-found",
      }),
    ).rejects.toThrow("Tarefa não encontrada.");
  });
});
