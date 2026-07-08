import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryTaskRepository } from "../../in-memory/InMemoryTaskRepository";
import { CompleteTaskStepUseCase } from "../CompleteTaskStepUseCase";
import { CreateTaskUseCase } from "../CreateTaskUseCase";

describe("CompleteTaskStepUseCase", () => {
  let taskRepository: InMemoryTaskRepository;
  let createTaskUseCase: CreateTaskUseCase;
  let completeTaskStepUseCase: CompleteTaskStepUseCase;

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository();
    createTaskUseCase = new CreateTaskUseCase(taskRepository);
    completeTaskStepUseCase = new CompleteTaskStepUseCase(taskRepository);
  });

  it("should complete a task step", async () => {
    const { task } = await createTaskUseCase.execute({
      userId: "user-1",
      title: "Tomar água",
      steps: [
        {
          title: "Pegar a garrafa",
        },
        {
          title: "Beber água",
        },
      ],
    });

    const result = await completeTaskStepUseCase.execute({
      taskId: task.id,
      stepId: task.steps[0]!.id,
    });

    const updatedTask = await taskRepository.findById(task.id);
    const tasks = await taskRepository.listByUserId("user-1");

    expect(result.task.steps[0]?.completed).toBe(true);
    expect(result.task.steps[0]?.completedAt).toBeInstanceOf(Date);

    expect(updatedTask?.steps[0]?.completed).toBe(true);
    expect(updatedTask?.status).toBe("in_progress");
    expect(updatedTask?.completed).toBe(false);

    expect(tasks).toHaveLength(1);
  });

  it("should complete a task when all steps are completed", async () => {
    const { task } = await createTaskUseCase.execute({
      userId: "user-1",
      title: "Tomar água",
      steps: [
        {
          title: "Pegar a garrafa",
        },
        {
          title: "Beber água",
        },
      ],
    });

    await completeTaskStepUseCase.execute({
      taskId: task.id,
      stepId: task.steps[0]!.id,
    });

    const result = await completeTaskStepUseCase.execute({
      taskId: task.id,
      stepId: task.steps[1]!.id,
    });

    const updatedTask = await taskRepository.findById(task.id);
    const tasks = await taskRepository.listByUserId("user-1");

    expect(result.task.status).toBe("completed");
    expect(result.task.completed).toBe(true);
    expect(result.task.completedAt).toBeInstanceOf(Date);

    expect(updatedTask?.status).toBe("completed");
    expect(updatedTask?.completed).toBe(true);

    expect(tasks).toHaveLength(1);
  });

  it("should keep task in progress when there are pending steps", async () => {
    const { task } = await createTaskUseCase.execute({
      userId: "user-1",
      title: "Fazer caminhada",
      date: "2026-07-10",
      steps: [
        {
          title: "Colocar o tênis",
        },
        {
          title: "Caminhar",
        },
      ],
    });

    const result = await completeTaskStepUseCase.execute({
      taskId: task.id,
      stepId: task.steps[0]!.id,
    });

    const tasks = await taskRepository.listByUserId("user-1");

    expect(result.task.status).toBe("in_progress");
    expect(result.task.completed).toBe(false);
    expect(result.task.steps[0]?.completed).toBe(true);
    expect(result.task.steps[1]?.completed).toBe(false);

    expect(tasks).toHaveLength(1);
  });

  it("should preserve task date when completing a step", async () => {
    const { task } = await createTaskUseCase.execute({
      userId: "user-1",
      title: "Ir ao médico",
      date: "2026-07-10",
      steps: [
        {
          title: "Separar documentos",
        },
      ],
    });

    const result = await completeTaskStepUseCase.execute({
      taskId: task.id,
      stepId: task.steps[0]!.id,
    });

    expect(result.task.date).toBe("2026-07-10");
    expect(result.task.completed).toBe(true);
  });

  it("should not complete a step without taskId", async () => {
    await expect(
      completeTaskStepUseCase.execute({
        taskId: "",
        stepId: "step-1",
      }),
    ).rejects.toThrow("Tarefa é obrigatória.");
  });

  it("should not complete a step without stepId", async () => {
    await expect(
      completeTaskStepUseCase.execute({
        taskId: "task-1",
        stepId: "",
      }),
    ).rejects.toThrow("Etapa é obrigatória.");
  });

  it("should not complete a step from a task that does not exist", async () => {
    await expect(
      completeTaskStepUseCase.execute({
        taskId: "task-1",
        stepId: "step-1",
      }),
    ).rejects.toThrow("Tarefa não encontrada.");
  });

  it("should not complete a step that does not exist", async () => {
    const { task } = await createTaskUseCase.execute({
      userId: "user-1",
      title: "Tomar água",
      steps: [
        {
          title: "Pegar a garrafa",
        },
      ],
    });

    await expect(
      completeTaskStepUseCase.execute({
        taskId: task.id,
        stepId: "step-1",
      }),
    ).rejects.toThrow("Etapa não encontrada.");
  });
});