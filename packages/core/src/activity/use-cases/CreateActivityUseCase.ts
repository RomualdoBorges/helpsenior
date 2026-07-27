import type { Activity, NecessaryResources, Step } from "../entities/Activity";
import type { ActivityRepository } from "../repositories/ActivityRepository";

export interface CreateActivityUseCaseInput {
  userId: string;
  title: string;
  steps: Step[];
  description?: string;
  resources?: NecessaryResources[];
}

export interface CreateActivityUseCaseOutput {
  activity: Activity;
}

function createId() {
  return crypto.randomUUID();
}

export class CreateActivityUseCase {
  private readonly activityRepository: ActivityRepository;

  constructor(activityRepository: ActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(input: CreateActivityUseCaseInput): Promise<CreateActivityUseCaseOutput> {
    if (!input.userId.trim()) {
      throw new Error("Usuário é obrigatório.");
    }

    if (!input.title.trim()) {
      throw new Error("Título da atividade é obrigatório.");
    }

    if (input.steps.length <= 0) {
      throw new Error("A atividade deve ter pelo menos um passo.");
    }

    const now = new Date();

    const activity: Activity = {
      id: createId(),
      userId: input.userId,
      title: input.title,
      steps: input.steps,
      createdAt: now,
      updatedAt: now,
    };
    
    if (input.description) {
      activity.description = input.description;
    }

    if (input.resources && input.resources.length > 0) {
      activity.resources = input.resources;
    }

    await this.activityRepository.create(activity);

    return { activity };
  }
}