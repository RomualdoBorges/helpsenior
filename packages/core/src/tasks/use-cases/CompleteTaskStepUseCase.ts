import type { Task } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";

export interface CompleteTaskStepUseCaseInput {
  taskId: string;
  stepId: string;
}

export interface CompleteTaskStepUseCaseOutput {
  task: Task;
}

export class CompleteTaskStepUseCase {
  private readonly taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(
    input: CompleteTaskStepUseCaseInput,
  ): Promise<CompleteTaskStepUseCaseOutput> {
    if (!input.taskId.trim()) {
      throw new Error("Tarefa é obrigatória.");
    }

    if (!input.stepId.trim()) {
      throw new Error("Etapa é obrigatória.");
    }

    const task = await this.taskRepository.findById(input.taskId);

    if (!task) {
      throw new Error("Tarefa não encontrada.");
    }

    const stepExists = task.steps.some((step) => step.id === input.stepId);

    if (!stepExists) {
      throw new Error("Etapa não encontrada.");
    }

    const now = new Date();

    const updatedSteps = task.steps.map((step) => {
      if (step.id !== input.stepId) {
        return step;
      }

      return {
        ...step,
        completed: true,
        completedAt: step.completedAt ?? now,
      };
    });

    const allStepsCompleted = updatedSteps.every((step) => step.completed);

    const updatedTask: Task = {
      ...task,
      steps: updatedSteps,
      status: allStepsCompleted ? "completed" : "in_progress",
      completed: allStepsCompleted,
      updatedAt: now,
    };

    if (allStepsCompleted) {
      updatedTask.completedAt = task.completedAt ?? now;
    }

    await this.taskRepository.update(updatedTask);

    return {
      task: updatedTask,
    };
  }
}