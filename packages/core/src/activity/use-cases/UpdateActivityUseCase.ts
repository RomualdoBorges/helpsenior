import type { Activity, NecessaryResources, Step } from "../entities/Activity";
import type { ActivityRepository } from "../repositories/ActivityRepository";

export interface UpdateActivityUseCaseInput {
  activityId: string;
  title: string;
  steps: Step[];
  description?: string;
  resources?: NecessaryResources[];
}

export interface UpdateActivityUseCaseOutput {
  activity: Activity;
}

export class UpdateActivityUseCase {
  private readonly activityRepository: ActivityRepository;

  constructor(activityRepository: ActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(input: UpdateActivityUseCaseInput): Promise<UpdateActivityUseCaseOutput> {
    if (!input.activityId.trim()) {
      throw new Error("Atividade é obrigatória.");
    }

    if (!input.title.trim()) {
      throw new Error("Título da atividade é obrigatório.");
    }

    if (input.steps.length <= 0) {
      throw new Error("A atividade deve ter pelo menos um passo.");
    }

    const activity = await this.activityRepository.findById(input.activityId);

    if (!activity) {
      throw new Error("Atividade não encontrada.");
    }

    const updatedActivity: Activity = {
      ...activity,
      title: input.title.trim(),
      steps: input.steps,
      updatedAt: new Date(),
    };

    if (input.description?.trim()) {
      updatedActivity.description = input.description.trim();
    } else {
      delete updatedActivity.description;
    }

    if (input.resources && input.resources.length > 0) {
      updatedActivity.resources = input.resources;
    } else {
      delete updatedActivity.resources;
    }

    await this.activityRepository.update(updatedActivity);

    return { activity: updatedActivity };
  }
}