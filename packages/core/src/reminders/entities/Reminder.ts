export type ReminderRecurrence = "none" | "daily" | "weekly" | "monthly";

export interface Reminder {
  id: string;
  userId: string;
  taskId?: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  completed: boolean;
  recurrence: ReminderRecurrence;
  recurrenceEndDate?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
