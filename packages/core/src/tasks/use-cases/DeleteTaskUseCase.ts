import type { TaskRepository } from "../repositories/TaskRepository";

export interface DeleteTaskUseCaseInput {
  taskId: string;
}

export class DeleteTaskUseCase {
  private readonly taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(input: DeleteTaskUseCaseInput): Promise<void> {
    if (!input.taskId.trim()) {
      throw new Error("Tarefa é obrigatória.");
    }

    const task = await this.taskRepository.findById(input.taskId);

    if (!task) {
      throw new Error("Tarefa não encontrada.");
    }

    await this.taskRepository.delete(input.taskId);
  }
}
