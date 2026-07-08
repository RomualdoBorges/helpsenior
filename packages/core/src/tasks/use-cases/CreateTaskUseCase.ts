import type { Task, TaskStep } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";

export interface CreateTaskUseCaseInput {
  userId: string;
  title: string;
  description?: string;
  steps?: Array<{
    title: string;
    description?: string;
  }>;
  date?: string;
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

    const now = new Date();

    const steps: TaskStep[] = (input.steps ?? []).map((step, index) => ({
      id: createId(),
      title: step.title,
      description: step.description,
      order: index + 1,
      completed: false,
    }));

    const task: Task = {
      id: createId(),
      userId: input.userId,
      title: input.title,
      steps,
      status: "pending",
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    if (input.description) {
      task.description = input.description;
    }

    if (input.date) {
      task.date = input.date;
    }

    await this.taskRepository.create(task);

    return {
      task,
    };
  }
}
