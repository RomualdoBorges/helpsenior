import type { Reminder } from "../entities/Reminder";

export interface ReminderRepository {
  create(reminder: Reminder): Promise<void>;
  findById(reminderId: string): Promise<Reminder | null>;
  listByUserId(userId: string): Promise<Reminder[]>;
  update(reminder: Reminder): Promise<void>;
}
