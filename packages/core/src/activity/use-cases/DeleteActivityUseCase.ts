import type { ActivityRepository } from "../repositories/ActivityRepository";

export interface DeleteActivityUseCaseInput {
  activityId: string;
}

export class DeleteActivityUseCase {
  private readonly activityRepository: ActivityRepository;

  constructor(activityRepository: ActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(input: DeleteActivityUseCaseInput): Promise<void> {
    if (!input.activityId.trim()) {
      throw new Error("Atividade é obrigatória.");
    }

    const activity = await this.activityRepository.findById(input.activityId);

    if (!activity) {
      throw new Error("Atividade não encontrada.");
    }

    await this.activityRepository.delete(input.activityId);
  }
}
