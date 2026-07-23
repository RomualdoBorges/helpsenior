import { describe, expect, it } from "vitest";

import { InMemoryActivityRepository } from "../../in-memory/InMemoryActivityRepository";
import { CreateActivityUseCase } from "../CreateActivityUseCase";
import { NecessaryResources, Step } from "../../entities/Activity";

describe("CreateActivityUseCase", () => {
  it("should create an activity", async () => {
    const repository = new InMemoryActivityRepository();
    const useCase = new CreateActivityUseCase(repository);

    const steps: Step[] = [
      { order: 1, description: "Tomar o remédio X antes do café" },
      { order: 2, description: "tomar café" },
      { order: 3, description: "tomar remédios Y e Z 10 minutos depois de forrar o estômago" },
    ];
    const resources: NecessaryResources[] = [
      { description: "Remédio X" },
      { description: "Remédio Y" },
      { description: "Remédio Z" },
    ];
    const result = await useCase.execute({
      userId: "user-1",
      title: "Tomar remédios do coração",
      description: "Tomar os 3 remédios da pressão pela manhã.",
      steps: steps,
      resources: resources,
    });

    expect(result.activity.id).toBeDefined();
    expect(result.activity.userId).toBe("user-1");
    expect(result.activity.title).toBe("Tomar remédios do coração");
    expect(result.activity.steps.length).toBe(3);
    expect(result.activity.resources!.length).toBe(3);
    expect(result.activity.description).toBe("Tomar os 3 remédios da pressão pela manhã.");
    expect(result.activity.createdAt).toBeInstanceOf(Date);
    expect(result.activity.updatedAt).toBeInstanceOf(Date);
  });

  it("should create an activity with description", async () => {
    const repository = new InMemoryActivityRepository();
    const useCase = new CreateActivityUseCase(repository);

    const steps: Step[] = [
      { order: 1, description: "Tomar o remédio X antes do café" },
      { order: 2, description: "tomar café" },
      { order: 3, description: "tomar remédios Y e Z 10 minutos depois de forrar o estômago" },
    ];
    const resources: NecessaryResources[] = [
      { description: "Remédio X" },
      { description: "Remédio Y" },
      { description: "Remédio Z" },
    ];
    const result = await useCase.execute({
      userId: "user-1",
      title: "Tomar remédios do coração",
      description: "Tomar os 3 remédios da pressão pela manhã.",
      steps: steps,
      resources: resources,
    });

    expect(result.activity.description).toBe(
      "Tomar os 3 remédios da pressão pela manhã.",
    );
  });

  it("should create an activity with resources", async () => {
    const repository = new InMemoryActivityRepository();
    const useCase = new CreateActivityUseCase(repository);

    const steps: Step[] = [
      { order: 1, description: "Tomar o remédio X antes do café" },
      { order: 2, description: "tomar café" },
      { order: 3, description: "tomar remédios Y e Z 10 minutos depois de forrar o estômago" },
    ];
    const resources: NecessaryResources[] = [
      { description: "Remédio X" },
      { description: "Remédio Y" },
      { description: "Remédio Z" },
    ];
    const result = await useCase.execute({
      userId: "user-1",
      title: "Tomar remédios do coração",
      description: "Tomar os 3 remédios da pressão pela manhã.",
      steps: steps,
      resources: resources,
    });

    expect(result.activity.resources).toEqual(resources);
  });

  it("should save the created activity in repository", async () => {
    const repository = new InMemoryActivityRepository();
    const useCase = new CreateActivityUseCase(repository);

    const steps: Step[] = [
      { order: 1, description: "Tomar o remédio X antes do café" },
      { order: 2, description: "tomar café" },
      { order: 3, description: "tomar remédios Y e Z 10 minutos depois de forrar o estômago" },
    ];
    const result = await useCase.execute({
      userId: "user-1",
      title: "Tomar remédios do coração",
      description: "Tomar os 3 remédios da pressão pela manhã.",
      steps: steps,
    });

    const savedActivity = await repository.findById(result.activity.id);

    expect(savedActivity).toEqual(result.activity);
  });

  it("should throw an error when userId is empty", async () => {
    const repository = new InMemoryActivityRepository();
    const useCase = new CreateActivityUseCase(repository);

    const steps: Step[] = [
      { order: 1, description: "Tomar o remédio X antes do café" },
      { order: 2, description: "tomar café" },
      { order: 3, description: "tomar remédios Y e Z 10 minutos depois de forrar o estômago" },
    ];

    await expect(
      useCase.execute({
        userId: "",
        title: "Tomar remédios do coração",
        description: "Tomar os 3 remédios da pressão pela manhã.",
        steps: steps,
      }),
    ).rejects.toThrow("Usuário é obrigatório.");
  });

  it("should throw an error when title is empty", async () => {
    const repository = new InMemoryActivityRepository();
    const useCase = new CreateActivityUseCase(repository);

    const steps: Step[] = [
      { order: 1, description: "Tomar o remédio X antes do café" },
      { order: 2, description: "tomar café" },
      { order: 3, description: "tomar remédios Y e Z 10 minutos depois de forrar o estômago" },
    ];

    await expect(
      useCase.execute({
        userId: "user-1",
        title: "",
        description: "Tomar os 3 remédios da pressão pela manhã.",
        steps: steps,
      }),
    ).rejects.toThrow("Título da atividade é obrigatório.");
  });

  it("should throw an error when steps is empty", async () => {
    const repository = new InMemoryActivityRepository();
    const useCase = new CreateActivityUseCase(repository);

    await expect(
      useCase.execute({
        userId: "user-1",
        title: "Tomar remédios do coração",
        description: "Tomar os 3 remédios da pressão pela manhã.",
        steps: [],
      }),
    ).rejects.toThrow("A atividade deve ter pelo menos um passo.");
  });
});