import type { Task } from "../entities/Task";
import type { TaskStep } from "../entities/TaskStep";
import type { TaskRepository } from "../repositories/TaskRepository";

interface CreateTaskUseCaseRequest {
  userId: string;
  title: string;
  description?: string;
  steps?: Array<{
    title: string;
    description?: string;
  }>;
}

interface CreateTaskUseCaseResponse {
  task: Task;
}

export class CreateTaskUseCase {
  private readonly taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(
    request: CreateTaskUseCaseRequest,
  ): Promise<CreateTaskUseCaseResponse> {
    if (!request.userId.trim()) {
      throw new Error("Usuário é obrigatório.");
    }

    if (!request.title.trim()) {
      throw new Error("Título da tarefa é obrigatório.");
    }

    const now = new Date();

    const steps: TaskStep[] =
      request.steps?.map((step, index) => ({
        id: crypto.randomUUID(),
        title: step.title,
        description: step.description,
        completed: false,
        order: index + 1,
      })) ?? [];

    const task: Task = {
      id: crypto.randomUUID(),
      userId: request.userId,
      title: request.title,
      description: request.description,
      status: "pending",
      steps,
      createdAt: now,
      updatedAt: now,
    };

    await this.taskRepository.create(task);

    return {
      task,
    };
  }
}
