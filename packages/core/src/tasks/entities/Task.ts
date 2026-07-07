import type { TaskStep } from "./TaskStep";

export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  steps: TaskStep[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
