import type { Reminder, ReminderRecurrence } from "../entities/Reminder";
import type { ReminderRepository } from "../repositories/ReminderRepository";

export interface CreateReminderUseCaseInput {
  userId: string;
  taskId?: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  recurrence?: ReminderRecurrence;
  recurrenceEndDate?: string;
}

export interface CreateReminderUseCaseOutput {
  reminder: Reminder;
}

export class CreateReminderUseCase {
  private readonly reminderRepository: ReminderRepository;

  constructor(reminderRepository: ReminderRepository) {
    this.reminderRepository = reminderRepository;
  }

  async execute(
    input: CreateReminderUseCaseInput,
  ): Promise<CreateReminderUseCaseOutput> {
    if (!input.userId.trim()) {
      throw new Error("Usuário é obrigatório.");
    }

    if (!input.title.trim()) {
      throw new Error("Título do lembrete é obrigatório.");
    }

    if (!input.date.trim()) {
      throw new Error("Data do lembrete é obrigatória.");
    }

    const now = new Date();

    const reminder: Reminder = {
      id: crypto.randomUUID(),
      userId: input.userId,
      title: input.title,
      date: input.date,
      completed: false,
      recurrence: input.recurrence ?? "none",
      createdAt: now,
      updatedAt: now,
    };

    if (input.taskId) {
      reminder.taskId = input.taskId;
    }

    if (input.description) {
      reminder.description = input.description;
    }

    if (input.time) {
      reminder.time = input.time;
    }

    if (input.recurrenceEndDate) {
      reminder.recurrenceEndDate = input.recurrenceEndDate;
    }

    await this.reminderRepository.create(reminder);

    return {
      reminder,
    };
  }
}
