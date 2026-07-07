import type { TaskRepository } from "../repositories/TaskRepository";

interface CompleteTaskUseCaseRequest {
  taskId: string;
}

export class CompleteTaskUseCase {
  private readonly taskRepository: TaskRepository;

  constructor(taskRepository: TaskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(request: CompleteTaskUseCaseRequest): Promise<void> {
    if (!request.taskId.trim()) {
      throw new Error("Tarefa é obrigatória.");
    }

    const task = await this.taskRepository.findById(request.taskId);

    if (!task) {
      throw new Error("Tarefa não encontrada.");
    }

    const now = new Date();

    const completedTask = {
      ...task,
      status: "completed" as const,
      steps: task.steps.map((step) => ({
        ...step,
        completed: true,
      })),
      updatedAt: now,
      completedAt: now,
    };

    await this.taskRepository.update(completedTask);
  }
}
