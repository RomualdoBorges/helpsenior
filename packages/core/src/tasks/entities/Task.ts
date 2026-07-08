export type TaskStatus = "pending" | "in_progress" | "completed";

export interface TaskStep {
  id: string;
  title: string;
  description?: string;
  order: number;
  completed: boolean;
  completedAt?: Date;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  steps: TaskStep[];
  status: TaskStatus;
  completed: boolean;
  date?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}