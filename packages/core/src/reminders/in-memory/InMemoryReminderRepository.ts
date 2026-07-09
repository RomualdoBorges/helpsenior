import type { Reminder } from "../entities/Reminder";
import type { ReminderRepository } from "../repositories/ReminderRepository";

export class InMemoryReminderRepository implements ReminderRepository {
  private readonly reminders: Reminder[] = [];

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

    if (reminderIndex < 0) {
      return;
    }

    this.reminders[reminderIndex] = reminder;
  }

  async delete(reminderId: string): Promise<void> {
    const reminderIndex = this.reminders.findIndex(
      (reminder) => reminder.id === reminderId,
    );

    if (reminderIndex < 0) {
      return;
    }

    this.reminders.splice(reminderIndex, 1);
  }
}