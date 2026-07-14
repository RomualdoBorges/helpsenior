import type { Task } from "../../entities/Task";

import { describe, expect, it } from "vitest";

import { InMemoryTaskRepository } from "../../in-memory/InMemoryTaskRepository";
import { UpdateTaskUseCase } from "../UpdateTaskUseCase";

function createTask(overrides?: Partial<Task>): Task {
  const now = new Date("2026-07-09T10:00:00.000Z");

  return {
    id: "task-1",
    userId: "user-1",
    title: "Pagar conta",
    description: "Pagar conta de luz",
    status: "pending",
    completed: false,
    date: "2026-07-10",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("UpdateTaskUseCase", () => {
  it("should update a task", async () => {
    const repository = new InMemoryTaskRepository();
    const task = createTask();

    await repository.create(task);

    const useCase = new UpdateTaskUseCase(repository);

    const result = await useCase.execute({
      taskId: task.id,
      title: "Comprar remédio",
      description: "Comprar remédio na farmácia",
      date: "2026-07-11",
    });

    expect(result.task.title).toBe("Comprar remédio");
    expect(result.task.description).toBe("Comprar remédio na farmácia");
    expect(result.task.date).toBe("2026-07-11");
    expect(result.task.updatedAt.getTime()).toBeGreaterThan(
      task.updatedAt.getTime(),
    );
  });

  it("should save the updated task in the repository", async () => {
    const repository = new InMemoryTaskRepository();
    const task = createTask();

    await repository.create(task);

    const useCase = new UpdateTaskUseCase(repository);

    await useCase.execute({
      taskId: task.id,
      title: "Comprar remédio",
      description: "Comprar remédio na farmácia",
      date: "2026-07-11",
    });

    const updatedTask = await repository.findById(task.id);

    expect(updatedTask?.title).toBe("Comprar remédio");
    expect(updatedTask?.description).toBe("Comprar remédio na farmácia");
    expect(updatedTask?.date).toBe("2026-07-11");
  });

  it("should trim title and description", async () => {
    const repository = new InMemoryTaskRepository();
    const task = createTask();

    await repository.create(task);

    const useCase = new UpdateTaskUseCase(repository);

    const result = await useCase.execute({
      taskId: task.id,
      title: "  Comprar remédio  ",
      description: "  Comprar remédio na farmácia  ",
      date: "2026-07-11",
    });

    expect(result.task.title).toBe("Comprar remédio");
    expect(result.task.description).toBe("Comprar remédio na farmácia");
  });

  it("should remove description when it is empty", async () => {
    const repository = new InMemoryTaskRepository();
    const task = createTask();

    await repository.create(task);

    const useCase = new UpdateTaskUseCase(repository);

    const result = await useCase.execute({
      taskId: task.id,
      title: "Comprar remédio",
      description: "",
      date: "2026-07-11",
    });

    expect(result.task.description).toBeUndefined();
  });

  it("should throw an error when date is empty", async () => {
    const repository = new InMemoryTaskRepository();
    const task = createTask();

    await repository.create(task);

    const useCase = new UpdateTaskUseCase(repository);

    await expect(
      useCase.execute({
        taskId: task.id,
        title: "Comprar remédio",
        description: "Comprar remédio na farmácia",
        date: "",
      }),
    ).rejects.toThrow("Data da tarefa é obrigatória.");
  });

  it("should preserve completed status", async () => {
    const repository = new InMemoryTaskRepository();
    const completedAt = new Date("2026-07-09T11:00:00.000Z");

    const task = createTask({
      status: "completed",
      completed: true,
      completedAt,
    });

    await repository.create(task);

    const useCase = new UpdateTaskUseCase(repository);

    const result = await useCase.execute({
      taskId: task.id,
      title: "Comprar remédio",
      description: "Comprar remédio na farmácia",
      date: "2026-07-11",
    });

    expect(result.task.status).toBe("completed");
    expect(result.task.completed).toBe(true);
    expect(result.task.completedAt).toBe(completedAt);
  });

  it("should throw an error when taskId is empty", async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new UpdateTaskUseCase(repository);

    await expect(
      useCase.execute({
        taskId: "",
        title: "Comprar remédio",
        date: "2026-07-11",
      }),
    ).rejects.toThrow("Tarefa é obrigatória.");
  });

  it("should throw an error when title is empty", async () => {
    const repository = new InMemoryTaskRepository();
    const task = createTask();

    await repository.create(task);

    const useCase = new UpdateTaskUseCase(repository);

    await expect(
      useCase.execute({
        taskId: task.id,
        title: "",
        date: "2026-07-11",
      }),
    ).rejects.toThrow("Título da tarefa é obrigatório.");
  });

  it("should throw an error when task does not exist", async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new UpdateTaskUseCase(repository);

    await expect(
      useCase.execute({
        taskId: "not-found",
        title: "Comprar remédio",
        date: "2026-07-11",
      }),
    ).rejects.toThrow("Tarefa não encontrada.");
  });
});
