import type { Reminder } from "../entities/Reminder";
import type { ReminderRepository } from "../repositories/ReminderRepository";

export class InMemoryReminderRepository implements ReminderRepository {
  private reminders: Reminder[] = [];

  async create(reminder: Reminder): Promise<void> {
    this.reminders.push(reminder);
  }

  async findById(reminderId: string): Promise<Reminder | null> {
    const reminder = this.reminders.find((item) => item.id === reminderId);

    return reminder ?? null;
  }

  async listByUserId(userId: string): Promise<Reminder[]> {
    return this.reminders.filter((reminder) => reminder.userId === userId);
  }

  async update(reminder: Reminder): Promise<void> {
    const reminderIndex = this.reminders.findIndex(
      (item) => item.id === reminder.id,
    );

    if (reminderIndex === -1) {
      throw new Error("Lembrete não encontrado.");
    }

    this.reminders[reminderIndex] = reminder;
  }
}
