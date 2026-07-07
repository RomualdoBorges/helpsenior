import type { Task } from "../entities/Task";

export interface TaskRepository {
  create(task: Task): Promise<void>;
  findById(taskId: string): Promise<Task | null>;
  listByUserId(userId: string): Promise<Task[]>;
  update(task: Task): Promise<void>;
}
