import type { Task } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";

export interface CompleteTaskUseCaseInput {
  taskId: string;
}

export interface CompleteTaskUseCaseOutput {
  task: Task;
}

export class CompleteTaskUseCase {
  private readonly taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(
    input: CompleteTaskUseCaseInput,
  ): Promise<CompleteTaskUseCaseOutput> {
    if (!input.taskId.trim()) {
      throw new Error("Tarefa é obrigatória.");
    }

    const task = await this.taskRepository.findById(input.taskId);

    if (!task) {
      throw new Error("Tarefa não encontrada.");
    }

    if (task.completed) {
      return {
        task,
      };
    }

    const now = new Date();

    const completedTask: Task = {
      ...task,
      status: "completed",
      completed: true,
      updatedAt: now,
      completedAt: now,
      steps: task.steps.map((step) => ({
        ...step,
        completed: true,
        completedAt: step.completedAt ?? now,
      })),
    };

    await this.taskRepository.update(completedTask);

    return {
      task: completedTask,
    };
  }
}