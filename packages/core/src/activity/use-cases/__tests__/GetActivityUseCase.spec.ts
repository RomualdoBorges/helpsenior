import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryActivityRepository } from "../../in-memory/InMemoryActivityRepository";
import { CreateActivityUseCase } from "../CreateActivityUseCase";
import { GetActivityUseCase } from "../GetActivityUseCase";

describe("GetActivityUseCase", () => {
    let activityRepository = new InMemoryActivityRepository();
    let createActivityUseCase = new CreateActivityUseCase(activityRepository);
    let getActivityUseCase = new GetActivityUseCase(activityRepository);

    it("should get activity by ID", async () => {

        const { activity: activityRemedio } = await createActivityUseCase.execute({
            userId: "user-1",
            title: "Tomar remédio da manhâ",
            steps: [{ order: 1, description: "Tomar remédio X e Y as 8h" }],
        });
        
        const { activity: getRemedio } = await getActivityUseCase.execute({
            activityId: activityRemedio.id,
        });

        expect(activityRemedio?.title).toBe(getRemedio?.title);
    });

    it("should return null when activity is not found", async () => {

        const { activity } = await getActivityUseCase.execute({
            activityId: "non-existent-id",
        });

        expect(activity).toBeNull();
    });

    it("should not get activity without activityId", async () => {

        await expect(() =>
            getActivityUseCase.execute({
                activityId: "",
            }),
        ).rejects.toThrow("Atividade é obrigatória.");
    });
});
