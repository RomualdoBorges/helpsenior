import type { Task } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";

interface ListTasksUseCaseRequest {
  userId: string;
}

interface ListTasksUseCaseResponse {
  tasks: Task[];
}

export class ListTasksUseCase {
  private readonly taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(
    request: ListTasksUseCaseRequest,
  ): Promise<ListTasksUseCaseResponse> {
    if (!request.userId.trim()) {
      throw new Error("Usuário é obrigatório.");
    }

    const tasks = await this.taskRepository.listByUserId(request.userId);

    return {
      tasks,
    };
  }
}
