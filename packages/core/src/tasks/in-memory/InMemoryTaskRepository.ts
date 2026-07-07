import type { Task } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";

export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Task[] = [];

  async create(task: Task): Promise<void> {
    this.tasks.push(task);
  }

  async findById(taskId: string): Promise<Task | null> {
    const task = this.tasks.find((task) => task.id === taskId);

    return task ?? null;
  }

  async listByUserId(userId: string): Promise<Task[]> {
    return this.tasks.filter((task) => task.userId === userId);
  }

  async update(task: Task): Promise<void> {
    const taskIndex = this.tasks.findIndex((item) => item.id === task.id);

    if (taskIndex === -1) {
      throw new Error("Tarefa não encontrada.");
    }

    this.tasks[taskIndex] = task;
  }
}
