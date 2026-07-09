import type { Task } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";

export interface UpdateTaskUseCaseInput {
  taskId: string;
  title: string;
  description?: string;
  date?: string;
}

export interface UpdateTaskUseCaseOutput {
  task: Task;
}

export class UpdateTaskUseCase {
  private readonly taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(input: UpdateTaskUseCaseInput): Promise<UpdateTaskUseCaseOutput> {
    if (!input.taskId.trim()) {
      throw new Error("Tarefa é obrigatória.");
    }

    if (!input.title.trim()) {
      throw new Error("Título da tarefa é obrigatório.");
    }

    const task = await this.taskRepository.findById(input.taskId);

    if (!task) {
      throw new Error("Tarefa não encontrada.");
    }

    const updatedTask: Task = {
      ...task,
      title: input.title.trim(),
      updatedAt: new Date(),
    };

    if (input.description?.trim()) {
      updatedTask.description = input.description.trim();
    } else {
      delete updatedTask.description;
    }

    if (input.date) {
      updatedTask.date = input.date;
    } else {
      delete updatedTask.date;
    }

    await this.taskRepository.update(updatedTask);

    return { task: updatedTask };
  }
}