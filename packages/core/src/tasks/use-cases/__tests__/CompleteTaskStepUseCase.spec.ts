import { describe, expect, it } from "vitest";

import { InMemoryTaskRepository } from "../../in-memory/InMemoryTaskRepository";
import { CompleteTaskStepUseCase } from "../CompleteTaskStepUseCase";
import { CreateTaskUseCase } from "../CreateTaskUseCase";

describe("CompleteTaskStepUseCase", () => {
  it("should complete a task step", async () => {
    const taskRepository = new InMemoryTaskRepository();

    const createTaskUseCase = new CreateTaskUseCase(taskRepository);
    const completeTaskStepUseCase = new CompleteTaskStepUseCase(taskRepository);

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

    const firstStep = task.steps[0];

    await completeTaskStepUseCase.execute({
      taskId: task.id,
      stepId: firstStep.id,
    });

    const updatedTask = await taskRepository.findById(task.id);

    expect(updatedTask).not.toBeNull();
    expect(updatedTask?.status).toBe("in_progress");
    expect(updatedTask?.completedAt).toBeUndefined();

    expect(updatedTask?.steps[0]?.completed).toBe(true);
    expect(updatedTask?.steps[1]?.completed).toBe(false);
  });

  it("should complete the task when all steps are completed", async () => {
    const taskRepository = new InMemoryTaskRepository();

    const createTaskUseCase = new CreateTaskUseCase(taskRepository);
    const completeTaskStepUseCase = new CompleteTaskStepUseCase(taskRepository);

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

    await completeTaskStepUseCase.execute({
      taskId: task.id,
      stepId: task.steps[0].id,
    });

    await completeTaskStepUseCase.execute({
      taskId: task.id,
      stepId: task.steps[1].id,
    });

    const updatedTask = await taskRepository.findById(task.id);

    expect(updatedTask).not.toBeNull();
    expect(updatedTask?.status).toBe("completed");
    expect(updatedTask?.completedAt).toBeInstanceOf(Date);
    expect(updatedTask?.steps.every((step) => step.completed)).toBe(true);
  });

  it("should not complete a step without taskId", async () => {
    const taskRepository = new InMemoryTaskRepository();
    const completeTaskStepUseCase = new CompleteTaskStepUseCase(taskRepository);

    await expect(() =>
      completeTaskStepUseCase.execute({
        taskId: "",
        stepId: "step-1",
      }),
    ).rejects.toThrow("Tarefa é obrigatória.");
  });

  it("should not complete a step without stepId", async () => {
    const taskRepository = new InMemoryTaskRepository();
    const completeTaskStepUseCase = new CompleteTaskStepUseCase(taskRepository);

    await expect(() =>
      completeTaskStepUseCase.execute({
        taskId: "task-1",
        stepId: "",
      }),
    ).rejects.toThrow("Etapa é obrigatória.");
  });

  it("should not complete a step from a task that does not exist", async () => {
    const taskRepository = new InMemoryTaskRepository();
    const completeTaskStepUseCase = new CompleteTaskStepUseCase(taskRepository);

    await expect(() =>
      completeTaskStepUseCase.execute({
        taskId: "invalid-task-id",
        stepId: "step-1",
      }),
    ).rejects.toThrow("Tarefa não encontrada.");
  });

  it("should not complete a step that does not exist", async () => {
    const taskRepository = new InMemoryTaskRepository();

    const createTaskUseCase = new CreateTaskUseCase(taskRepository);
    const completeTaskStepUseCase = new CompleteTaskStepUseCase(taskRepository);

    const { task } = await createTaskUseCase.execute({
      userId: "user-1",
      title: "Tomar remédio",
      steps: [
        {
          title: "Pegar o remédio",
        },
      ],
    });

    await expect(() =>
      completeTaskStepUseCase.execute({
        taskId: task.id,
        stepId: "invalid-step-id",
      }),
    ).rejects.toThrow("Etapa não encontrada.");
  });
});
