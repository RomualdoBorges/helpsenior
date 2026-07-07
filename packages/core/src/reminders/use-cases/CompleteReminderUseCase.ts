import type { Reminder } from "../entities/Reminder";
import type { ReminderRepository } from "../repositories/ReminderRepository";
import { calculateNextReminderDate } from "../utils/calculateNextReminderDate";

export interface CompleteReminderUseCaseInput {
  reminderId: string;
}

export interface CompleteReminderUseCaseOutput {
  reminder: Reminder;
  nextReminder: Reminder | null;
}

export class CompleteReminderUseCase {
  private readonly reminderRepository: ReminderRepository;

  constructor(reminderRepository: ReminderRepository) {
    this.reminderRepository = reminderRepository;
  }

  async execute(
    input: CompleteReminderUseCaseInput,
  ): Promise<CompleteReminderUseCaseOutput> {
    if (!input.reminderId.trim()) {
      throw new Error("Lembrete é obrigatório.");
    }

    const reminder = await this.reminderRepository.findById(input.reminderId);

    if (!reminder) {
      throw new Error("Lembrete não encontrado.");
    }

    const now = new Date();

    const completedReminder: Reminder = {
      ...reminder,
      completed: true,
      updatedAt: now,
      completedAt: now,
    };

    await this.reminderRepository.update(completedReminder);

    const nextReminder = this.createNextReminderIfNeeded(
      completedReminder,
      now,
    );

    if (nextReminder) {
      await this.reminderRepository.create(nextReminder);
    }

    return {
      reminder: completedReminder,
      nextReminder,
    };
  }

  private createNextReminderIfNeeded(
    reminder: Reminder,
    now: Date,
  ): Reminder | null {
    const nextDate = calculateNextReminderDate({
      currentDate: reminder.date,
      recurrence: reminder.recurrence,
    });

    if (!nextDate) {
      return null;
    }

    if (reminder.recurrenceEndDate && nextDate > reminder.recurrenceEndDate) {
      return null;
    }

    const nextReminder: Reminder = {
      id: crypto.randomUUID(),
      userId: reminder.userId,
      title: reminder.title,
      date: nextDate,
      completed: false,
      recurrence: reminder.recurrence,
      createdAt: now,
      updatedAt: now,
    };

    if (reminder.taskId) {
      nextReminder.taskId = reminder.taskId;
    }

    if (reminder.description) {
      nextReminder.description = reminder.description;
    }

    if (reminder.time) {
      nextReminder.time = reminder.time;
    }

    if (reminder.recurrenceEndDate) {
      nextReminder.recurrenceEndDate = reminder.recurrenceEndDate;
    }

    return nextReminder;
  }
}
