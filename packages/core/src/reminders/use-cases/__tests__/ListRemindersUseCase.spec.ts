import { describe, expect, it } from "vitest";

import { InMemoryReminderRepository } from "../../in-memory/InMemoryReminderRepository";
import { CreateReminderUseCase } from "../CreateReminderUseCase";
import { ListRemindersUseCase } from "../ListRemindersUseCase";

describe("ListRemindersUseCase", () => {
  it("should list reminders by user id", async () => {
    const reminderRepository = new InMemoryReminderRepository();

    const createReminderUseCase = new CreateReminderUseCase(reminderRepository);
    const listRemindersUseCase = new ListRemindersUseCase(reminderRepository);

    await createReminderUseCase.execute({
      userId: "user-1",
      title: "Tomar remédio",
      date: "2026-07-10",
      time: "08:00",
    });

    await createReminderUseCase.execute({
      userId: "user-1",
      title: "Consulta médica",
      date: "2026-07-15",
      time: "14:30",
    });

    await createReminderUseCase.execute({
      userId: "user-2",
      title: "Pagar conta",
      date: "2026-07-20",
    });

    const { reminders } = await listRemindersUseCase.execute({
      userId: "user-1",
    });

    expect(reminders).toHaveLength(2);
    expect(reminders[0]?.userId).toBe("user-1");
    expect(reminders[1]?.userId).toBe("user-1");
  });

  it("should return an empty list when user has no reminders", async () => {
    const reminderRepository = new InMemoryReminderRepository();
    const listRemindersUseCase = new ListRemindersUseCase(reminderRepository);

    const { reminders } = await listRemindersUseCase.execute({
      userId: "user-1",
    });

    expect(reminders).toHaveLength(0);
  });

  it("should not allow empty user id", async () => {
    const reminderRepository = new InMemoryReminderRepository();
    const listRemindersUseCase = new ListRemindersUseCase(reminderRepository);

    await expect(() =>
      listRemindersUseCase.execute({
        userId: "",
      }),
    ).rejects.toThrow("Usuário é obrigatório.");
  });
});
