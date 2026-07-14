import type { Task } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";

export interface CreateTaskUseCaseInput {
  userId: string;
  title: string;
  description?: string;
  date: string;
}

export interface CreateTaskUseCaseOutput {
  task: Task;
}

function createId() {
  return crypto.randomUUID();
}

export class CreateTaskUseCase {
  private readonly taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(input: CreateTaskUseCaseInput): Promise<CreateTaskUseCaseOutput> {
    if (!input.userId.trim()) {
      throw new Error("Usuário é obrigatório.");
    }

    if (!input.title.trim()) {
      throw new Error("Título da tarefa é obrigatório.");
    }

    if (!input.date.trim()) {
      throw new Error("Data da tarefa é obrigatória.");
    }

    const now = new Date();

    const task: Task = {
      id: createId(),
      userId: input.userId,
      title: input.title,
      status: "pending",
      completed: false,
      date: input.date.trim(),
      createdAt: now,
      updatedAt: now,
    };

    if (input.description) {
      task.description = input.description;
    }

    await this.taskRepository.create(task);

    return { task };
  }
}
