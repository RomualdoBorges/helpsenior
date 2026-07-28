export type TaskStatus = "pending" | "completed";

export interface Task {
  id: string;
  userId: string;
  activityId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  completed: boolean;
  date?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}