import type { Task } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";

export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks: Task[] = [];

  async create(task: Task): Promise<void> {
    this.tasks.push(task);
  }

  async findById(taskId: string): Promise<Task | null> {
    const task = this.tasks.find((item) => item.id === taskId);

    return task ?? null;
  }

  async listByUserId(userId: string): Promise<Task[]> {
    return this.tasks.filter((task) => task.userId === userId);
  }

  async update(task: Task): Promise<void> {
    const taskIndex = this.tasks.findIndex((item) => item.id === task.id);

    if (taskIndex < 0) {
      return;
    }

    this.tasks[taskIndex] = task;
  }

  async delete(taskId: string): Promise<void> {
    const taskIndex = this.tasks.findIndex((task) => task.id === taskId);

    if (taskIndex < 0) {
      return;
    }

    this.tasks.splice(taskIndex, 1);
  }
}
