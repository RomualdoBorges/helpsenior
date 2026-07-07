import { beforeEach, describe, expect, it } from "vitest";

import type { Reminder } from "../../entities/Reminder";
import { InMemoryReminderRepository } from "../../in-memory/InMemoryReminderRepository";
import { CompleteReminderUseCase } from "../CompleteReminderUseCase";

describe("CompleteReminderUseCase", () => {
  let reminderRepository: InMemoryReminderRepository;
  let completeReminderUseCase: CompleteReminderUseCase;

  beforeEach(() => {
    reminderRepository = new InMemoryReminderRepository();
    completeReminderUseCase = new CompleteReminderUseCase(reminderRepository);
  });

  function createReminder(overrides: Partial<Reminder> = {}): Reminder {
    return {
      id: "reminder-1",
      userId: "user-1",
      title: "Tomar remédio",
      description: "Tomar remédio da pressão",
      date: "2026-07-10",
      time: "08:00",
      completed: false,
      recurrence: "none",
      createdAt: new Date("2026-07-10T07:00:00.000Z"),
      updatedAt: new Date("2026-07-10T07:00:00.000Z"),
      ...overrides,
    };
  }

  it("should complete a reminder", async () => {
    const reminder = createReminder();

    await reminderRepository.create(reminder);

    const result = await completeReminderUseCase.execute({
      reminderId: reminder.id,
    });

    expect(result.reminder.completed).toBe(true);
    expect(result.reminder.completedAt).toBeInstanceOf(Date);
    expect(result.nextReminder).toBeNull();

    const savedReminder = await reminderRepository.findById(reminder.id);

    expect(savedReminder?.completed).toBe(true);
    expect(savedReminder?.completedAt).toBeInstanceOf(Date);
  });

  it("should not allow empty reminder id", async () => {
    await expect(
      completeReminderUseCase.execute({
        reminderId: "",
      }),
    ).rejects.toThrow("Lembrete é obrigatório.");
  });

  it("should throw an error when reminder does not exist", async () => {
    await expect(
      completeReminderUseCase.execute({
        reminderId: "invalid-reminder-id",
      }),
    ).rejects.toThrow("Lembrete não encontrado.");
  });

  it("should create next daily reminder when completing a recurring reminder", async () => {
    const reminder = createReminder({
      recurrence: "daily",
      date: "2026-07-10",
    });

    await reminderRepository.create(reminder);

    const result = await completeReminderUseCase.execute({
      reminderId: reminder.id,
    });

    expect(result.reminder.completed).toBe(true);
    expect(result.nextReminder).not.toBeNull();
    expect(result.nextReminder?.id).not.toBe(reminder.id);
    expect(result.nextReminder?.userId).toBe(reminder.userId);
    expect(result.nextReminder?.title).toBe(reminder.title);
    expect(result.nextReminder?.description).toBe(reminder.description);
    expect(result.nextReminder?.date).toBe("2026-07-11");
    expect(result.nextReminder?.time).toBe("08:00");
    expect(result.nextReminder?.completed).toBe(false);
    expect(result.nextReminder?.recurrence).toBe("daily");

    const reminders = await reminderRepository.listByUserId("user-1");

    expect(reminders).toHaveLength(2);
  });

  it("should create next weekly reminder when completing a recurring reminder", async () => {
    const reminder = createReminder({
      recurrence: "weekly",
      date: "2026-07-10",
    });

    await reminderRepository.create(reminder);

    const result = await completeReminderUseCase.execute({
      reminderId: reminder.id,
    });

    expect(result.nextReminder).not.toBeNull();
    expect(result.nextReminder?.date).toBe("2026-07-17");
    expect(result.nextReminder?.recurrence).toBe("weekly");

    const reminders = await reminderRepository.listByUserId("user-1");

    expect(reminders).toHaveLength(2);
  });

  it("should create next monthly reminder when completing a recurring reminder", async () => {
    const reminder = createReminder({
      recurrence: "monthly",
      date: "2026-07-10",
    });

    await reminderRepository.create(reminder);

    const result = await completeReminderUseCase.execute({
      reminderId: reminder.id,
    });

    expect(result.nextReminder).not.toBeNull();
    expect(result.nextReminder?.date).toBe("2026-08-10");
    expect(result.nextReminder?.recurrence).toBe("monthly");

    const reminders = await reminderRepository.listByUserId("user-1");

    expect(reminders).toHaveLength(2);
  });

  it("should keep the last valid day when creating next monthly reminder", async () => {
    const reminder = createReminder({
      recurrence: "monthly",
      date: "2026-01-31",
    });

    await reminderRepository.create(reminder);

    const result = await completeReminderUseCase.execute({
      reminderId: reminder.id,
    });

    expect(result.nextReminder).not.toBeNull();
    expect(result.nextReminder?.date).toBe("2026-02-28");

    const reminders = await reminderRepository.listByUserId("user-1");

    expect(reminders).toHaveLength(2);
  });

  it("should create next recurring reminder when next date is equal recurrence end date", async () => {
    const reminder = createReminder({
      recurrence: "daily",
      date: "2026-07-10",
      recurrenceEndDate: "2026-07-11",
    });

    await reminderRepository.create(reminder);

    const result = await completeReminderUseCase.execute({
      reminderId: reminder.id,
    });

    expect(result.nextReminder).not.toBeNull();
    expect(result.nextReminder?.date).toBe("2026-07-11");
    expect(result.nextReminder?.recurrenceEndDate).toBe("2026-07-11");

    const reminders = await reminderRepository.listByUserId("user-1");

    expect(reminders).toHaveLength(2);
  });

  it("should not create next recurring reminder when next date is after recurrence end date", async () => {
    const reminder = createReminder({
      recurrence: "daily",
      date: "2026-07-10",
      recurrenceEndDate: "2026-07-10",
    });

    await reminderRepository.create(reminder);

    const result = await completeReminderUseCase.execute({
      reminderId: reminder.id,
    });

    expect(result.reminder.completed).toBe(true);
    expect(result.nextReminder).toBeNull();

    const reminders = await reminderRepository.listByUserId("user-1");

    expect(reminders).toHaveLength(1);
  });

  it("should preserve task id when creating next recurring reminder", async () => {
    const reminder = createReminder({
      taskId: "task-1",
      recurrence: "daily",
      date: "2026-07-10",
    });

    await reminderRepository.create(reminder);

    const result = await completeReminderUseCase.execute({
      reminderId: reminder.id,
    });

    expect(result.nextReminder).not.toBeNull();
    expect(result.nextReminder?.taskId).toBe("task-1");
  });
});
