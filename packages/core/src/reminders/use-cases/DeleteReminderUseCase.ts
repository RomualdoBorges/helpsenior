import type { ReminderRepository } from "../repositories/ReminderRepository";

export interface DeleteReminderUseCaseInput {
  reminderId: string;
}

export class DeleteReminderUseCase {
  private readonly reminderRepository: ReminderRepository;

  constructor(reminderRepository: ReminderRepository) {
    this.reminderRepository = reminderRepository;
  }

  async execute(input: DeleteReminderUseCaseInput): Promise<void> {
    if (!input.reminderId.trim()) {
      throw new Error("Lembrete é obrigatório.");
    }

    const reminder = await this.reminderRepository.findById(input.reminderId);

    if (!reminder) {
      throw new Error("Lembrete não encontrado.");
    }

    await this.reminderRepository.delete(input.reminderId);
  }
}