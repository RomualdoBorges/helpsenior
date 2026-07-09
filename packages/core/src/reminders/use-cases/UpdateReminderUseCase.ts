import type {
  Reminder,
  ReminderRecurrence,
} from "../entities/Reminder";
import type { ReminderRepository } from "../repositories/ReminderRepository";

export interface UpdateReminderUseCaseInput {
  reminderId: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  recurrence?: ReminderRecurrence;
  recurrenceEndDate?: string;
}

export interface UpdateReminderUseCaseOutput {
  reminder: Reminder;
}

export class UpdateReminderUseCase {
  private readonly reminderRepository: ReminderRepository;

  constructor(reminderRepository: ReminderRepository) {
    this.reminderRepository = reminderRepository;
  }

  async execute(
    input: UpdateReminderUseCaseInput,
  ): Promise<UpdateReminderUseCaseOutput> {
    if (!input.reminderId.trim()) {
      throw new Error("Lembrete é obrigatório.");
    }

    if (!input.title.trim()) {
      throw new Error("Título do lembrete é obrigatório.");
    }

    if (!input.date.trim()) {
      throw new Error("Data do lembrete é obrigatória.");
    }

    const reminder = await this.reminderRepository.findById(input.reminderId);

    if (!reminder) {
      throw new Error("Lembrete não encontrado.");
    }

    const recurrence = input.recurrence ?? "none";

    const updatedReminder: Reminder = {
      ...reminder,
      title: input.title.trim(),
      date: input.date,
      recurrence,
      updatedAt: new Date(),
    };

    if (input.description?.trim()) {
      updatedReminder.description = input.description.trim();
    } else {
      delete updatedReminder.description;
    }

    if (input.time) {
      updatedReminder.time = input.time;
    } else {
      delete updatedReminder.time;
    }

    if (recurrence !== "none" && input.recurrenceEndDate) {
      updatedReminder.recurrenceEndDate = input.recurrenceEndDate;
    } else {
      delete updatedReminder.recurrenceEndDate;
    }

    await this.reminderRepository.update(updatedReminder);

    return { reminder: updatedReminder };
  }
}