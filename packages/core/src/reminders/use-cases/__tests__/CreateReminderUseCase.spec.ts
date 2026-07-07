import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryReminderRepository } from "../../in-memory/InMemoryReminderRepository";
import { CreateReminderUseCase } from "../CreateReminderUseCase";

describe("CreateReminderUseCase", () => {
  let reminderRepository: InMemoryReminderRepository;
  let createReminderUseCase: CreateReminderUseCase;

  beforeEach(() => {
    reminderRepository = new InMemoryReminderRepository();
    createReminderUseCase = new CreateReminderUseCase(reminderRepository);
  });

  it("should create a reminder", async () => {
    const result = await createReminderUseCase.execute({
      userId: "user-1",
      title: "Tomar remédio",
      description: "Tomar remédio da pressão",
      date: "2026-07-10",
      time: "08:00",
    });

    expect(result.reminder.id).toBeTruthy();
    expect(result.reminder.userId).toBe("user-1");
    expect(result.reminder.title).toBe("Tomar remédio");
    expect(result.reminder.description).toBe("Tomar remédio da pressão");
    expect(result.reminder.date).toBe("2026-07-10");
    expect(result.reminder.time).toBe("08:00");
    expect(result.reminder.completed).toBe(false);
    expect(result.reminder.recurrence).toBe("none");
    expect(result.reminder.createdAt).toBeInstanceOf(Date);
    expect(result.reminder.updatedAt).toBeInstanceOf(Date);

    const reminders = await reminderRepository.listByUserId("user-1");

    expect(reminders).toHaveLength(1);
  });

  it("should create a reminder linked to a task", async () => {
    const result = await createReminderUseCase.execute({
      userId: "user-1",
      taskId: "task-1",
      title: "Tomar remédio",
      date: "2026-07-10",
    });

    expect(result.reminder.taskId).toBe("task-1");

    const reminders = await reminderRepository.listByUserId("user-1");

    expect(reminders).toHaveLength(1);
    expect(reminders[0]?.taskId).toBe("task-1");
  });

  it("should create a daily recurring reminder", async () => {
    const result = await createReminderUseCase.execute({
      userId: "user-1",
      title: "Tomar remédio",
      date: "2026-07-10",
      time: "08:00",
      recurrence: "daily",
    });

    expect(result.reminder.recurrence).toBe("daily");
    expect(result.reminder.recurrenceEndDate).toBeUndefined();

    const reminders = await reminderRepository.listByUserId("user-1");

    expect(reminders).toHaveLength(1);
    expect(reminders[0]?.recurrence).toBe("daily");
  });

  it("should create a weekly recurring reminder", async () => {
    const result = await createReminderUseCase.execute({
      userId: "user-1",
      title: "Caminhada",
      date: "2026-07-10",
      time: "09:00",
      recurrence: "weekly",
    });

    expect(result.reminder.recurrence).toBe("weekly");

    const reminders = await reminderRepository.listByUserId("user-1");

    expect(reminders).toHaveLength(1);
    expect(reminders[0]?.recurrence).toBe("weekly");
  });

  it("should create a monthly recurring reminder", async () => {
    const result = await createReminderUseCase.execute({
      userId: "user-1",
      title: "Pagar conta",
      date: "2026-07-10",
      recurrence: "monthly",
    });

    expect(result.reminder.recurrence).toBe("monthly");

    const reminders = await reminderRepository.listByUserId("user-1");

    expect(reminders).toHaveLength(1);
    expect(reminders[0]?.recurrence).toBe("monthly");
  });

  it("should create a recurring reminder with recurrence end date", async () => {
    const result = await createReminderUseCase.execute({
      userId: "user-1",
      title: "Tomar remédio",
      date: "2026-07-10",
      time: "08:00",
      recurrence: "daily",
      recurrenceEndDate: "2026-07-20",
    });

    expect(result.reminder.recurrence).toBe("daily");
    expect(result.reminder.recurrenceEndDate).toBe("2026-07-20");

    const reminders = await reminderRepository.listByUserId("user-1");

    expect(reminders).toHaveLength(1);
    expect(reminders[0]?.recurrenceEndDate).toBe("2026-07-20");
  });

  it("should not allow empty user id", async () => {
    await expect(
      createReminderUseCase.execute({
        userId: "",
        title: "Tomar remédio",
        date: "2026-07-10",
      }),
    ).rejects.toThrow("Usuário é obrigatório.");
  });

  it("should not allow empty title", async () => {
    await expect(
      createReminderUseCase.execute({
        userId: "user-1",
        title: "",
        date: "2026-07-10",
      }),
    ).rejects.toThrow("Título do lembrete é obrigatório.");
  });

  it("should not allow empty date", async () => {
    await expect(
      createReminderUseCase.execute({
        userId: "user-1",
        title: "Tomar remédio",
        date: "",
      }),
    ).rejects.toThrow("Data do lembrete é obrigatória.");
  });
});
