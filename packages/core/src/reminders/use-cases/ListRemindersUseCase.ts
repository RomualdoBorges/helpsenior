import type { Reminder } from "../entities/Reminder";
import type { ReminderRepository } from "../repositories/ReminderRepository";

interface ListRemindersUseCaseRequest {
  userId: string;
}

interface ListRemindersUseCaseResponse {
  reminders: Reminder[];
}

export class ListRemindersUseCase {
  private readonly reminderRepository: ReminderRepository;

  constructor(reminderRepository: ReminderRepository) {
    this.reminderRepository = reminderRepository;
  }

  async execute(
    request: ListRemindersUseCaseRequest,
  ): Promise<ListRemindersUseCaseResponse> {
    if (!request.userId.trim()) {
      throw new Error("Usuário é obrigatório.");
    }

    const reminders = await this.reminderRepository.listByUserId(
      request.userId,
    );

    return { reminders };
  }
}
