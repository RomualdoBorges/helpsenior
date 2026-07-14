import { describe, expect, it } from "vitest";

import { InMemoryTaskRepository } from "../../in-memory/InMemoryTaskRepository";
import { CreateTaskUseCase } from "../CreateTaskUseCase";

describe("CreateTaskUseCase", () => {
  it("should create a task", async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new CreateTaskUseCase(repository);

    const result = await useCase.execute({
      userId: "user-1",
      title: "Tomar remédio",
      date: "2026-07-10",
    });

    expect(result.task.id).toBeDefined();
    expect(result.task.userId).toBe("user-1");
    expect(result.task.title).toBe("Tomar remédio");
    expect(result.task.status).toBe("pending");
    expect(result.task.completed).toBe(false);
    expect(result.task.date).toBe("2026-07-10");
    expect(result.task.createdAt).toBeInstanceOf(Date);
    expect(result.task.updatedAt).toBeInstanceOf(Date);
  });

  it("should create a task with description", async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new CreateTaskUseCase(repository);

    const result = await useCase.execute({
      userId: "user-1",
      title: "Tomar remédio",
      description: "Tomar o remédio da pressão após o café.",
      date: "2026-07-10",
    });

    expect(result.task.description).toBe(
      "Tomar o remédio da pressão após o café.",
    );
  });

  it("should create a task with date", async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new CreateTaskUseCase(repository);

    const result = await useCase.execute({
      userId: "user-1",
      title: "Ir ao médico",
      date: "2026-07-10",
    });

    expect(result.task.date).toBe("2026-07-10");
  });

  it("should save the created task in repository", async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new CreateTaskUseCase(repository);

    const result = await useCase.execute({
      userId: "user-1",
      title: "Pagar conta",
      date: "2026-07-10",
    });

    const savedTask = await repository.findById(result.task.id);

    expect(savedTask).toEqual(result.task);
  });

  it("should throw an error when userId is empty", async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new CreateTaskUseCase(repository);

    await expect(
      useCase.execute({
        userId: "",
        title: "Tomar remédio",
        date: "2026-07-10",
      }),
    ).rejects.toThrow("Usuário é obrigatório.");
  });

  it("should throw an error when title is empty", async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new CreateTaskUseCase(repository);

    await expect(
      useCase.execute({
        userId: "user-1",
        title: "",
        date: "2026-07-10",
      }),
    ).rejects.toThrow("Título da tarefa é obrigatório.");
  });

  it("should throw an error when date is empty", async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new CreateTaskUseCase(repository);

    await expect(
      useCase.execute({
        userId: "user-1",
        title: "Tomar remédio",
        date: "",
      }),
    ).rejects.toThrow("Data da tarefa é obrigatória.");
  });
});
