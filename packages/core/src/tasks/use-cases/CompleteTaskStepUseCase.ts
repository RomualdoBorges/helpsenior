import type { Task } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";

interface CompleteTaskStepUseCaseRequest {
  taskId: string;
  stepId: string;
}

export class CompleteTaskStepUseCase {
  private readonly taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(request: CompleteTaskStepUseCaseRequest): Promise<void> {
    if (!request.taskId.trim()) {
      throw new Error("Tarefa é obrigatória.");
    }

    if (!request.stepId.trim()) {
      throw new Error("Etapa é obrigatória.");
    }

    const task = await this.taskRepository.findById(request.taskId);

    if (!task) {
      throw new Error("Tarefa não encontrada.");
    }

    const stepExists = task.steps.some((step) => step.id === request.stepId);

    if (!stepExists) {
      throw new Error("Etapa não encontrada.");
    }

    const updatedSteps = task.steps.map((step) => {
      if (step.id !== request.stepId) {
        return step;
      }

      return {
        ...step,
        completed: true,
      };
    });

    const allStepsCompleted = updatedSteps.every((step) => step.completed);

    const now = new Date();

    const updatedTask: Task = {
      ...task,
      steps: updatedSteps,
      status: allStepsCompleted ? "completed" : "in_progress",
      updatedAt: now,
      completedAt: allStepsCompleted ? now : undefined,
    };

    await this.taskRepository.update(updatedTask);
  }
}
