import type { Reminder } from "../../entities/Reminder";

import { describe, expect, it } from "vitest";

import { InMemoryReminderRepository } from "../../in-memory/InMemoryReminderRepository";
import { UpdateReminderUseCase } from "../UpdateReminderUseCase";

function createReminder(overrides?: Partial<Reminder>): Reminder {
  const now = new Date("2026-07-09T10:00:00.000Z");

  return {
    id: "reminder-1",
    userId: "user-1",
    title: "Tomar remédio",
    description: "Tomar remédio da pressão",
    date: "2026-07-10",
    time: "09:00",
    completed: false,
    recurrence: "none",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("UpdateReminderUseCase", () => {
  it("should update a reminder", async () => {
    const repository = new InMemoryReminderRepository();
    const reminder = createReminder();

    await repository.create(reminder);

    const useCase = new UpdateReminderUseCase(repository);

    const result = await useCase.execute({
      reminderId: reminder.id,
      title: "Consulta médica",
      description: "Consulta no cardiologista",
      date: "2026-07-11",
      time: "14:30",
      recurrence: "weekly",
      recurrenceEndDate: "2026-08-11",
    });

    expect(result.reminder.title).toBe("Consulta médica");
    expect(result.reminder.description).toBe("Consulta no cardiologista");
    expect(result.reminder.date).toBe("2026-07-11");
    expect(result.reminder.time).toBe("14:30");
    expect(result.reminder.recurrence).toBe("weekly");
    expect(result.reminder.recurrenceEndDate).toBe("2026-08-11");
    expect(result.reminder.updatedAt.getTime()).toBeGreaterThan(
      reminder.updatedAt.getTime(),
    );
  });

  it("should save the updated reminder in the repository", async () => {
    const repository = new InMemoryReminderRepository();
    const reminder = createReminder();

    await repository.create(reminder);

    const useCase = new UpdateReminderUseCase(repository);

    await useCase.execute({
      reminderId: reminder.id,
      title: "Consulta médica",
      description: "Consulta no cardiologista",
      date: "2026-07-11",
      time: "14:30",
      recurrence: "weekly",
      recurrenceEndDate: "2026-08-11",
    });

    const updatedReminder = await repository.findById(reminder.id);

    expect(updatedReminder?.title).toBe("Consulta médica");
    expect(updatedReminder?.description).toBe("Consulta no cardiologista");
    expect(updatedReminder?.date).toBe("2026-07-11");
    expect(updatedReminder?.time).toBe("14:30");
    expect(updatedReminder?.recurrence).toBe("weekly");
    expect(updatedReminder?.recurrenceEndDate).toBe("2026-08-11");
  });

  it("should trim title and description", async () => {
    const repository = new InMemoryReminderRepository();
    const reminder = createReminder();

    await repository.create(reminder);

    const useCase = new UpdateReminderUseCase(repository);

    const result = await useCase.execute({
      reminderId: reminder.id,
      title: "  Consulta médica  ",
      description: "  Consulta no cardiologista  ",
      date: "2026-07-11",
      time: "14:30",
      recurrence: "none",
    });

    expect(result.reminder.title).toBe("Consulta médica");
    expect(result.reminder.description).toBe("Consulta no cardiologista");
  });

  it("should remove description when it is empty", async () => {
    const repository = new InMemoryReminderRepository();
    const reminder = createReminder();

    await repository.create(reminder);

    const useCase = new UpdateReminderUseCase(repository);

    const result = await useCase.execute({
      reminderId: reminder.id,
      title: "Consulta médica",
      description: "",
      date: "2026-07-11",
      time: "14:30",
      recurrence: "none",
    });

    expect(result.reminder.description).toBeUndefined();
  });

  it("should remove time when it is empty", async () => {
    const repository = new InMemoryReminderRepository();
    const reminder = createReminder();

    await repository.create(reminder);

    const useCase = new UpdateReminderUseCase(repository);

    const result = await useCase.execute({
      reminderId: reminder.id,
      title: "Consulta médica",
      description: "Consulta no cardiologista",
      date: "2026-07-11",
      time: "",
      recurrence: "none",
    });

    expect(result.reminder.time).toBeUndefined();
  });

  it("should remove recurrenceEndDate when recurrence is none", async () => {
    const repository = new InMemoryReminderRepository();

    const reminder = createReminder({
      recurrence: "daily",
      recurrenceEndDate: "2026-08-10",
    });

    await repository.create(reminder);

    const useCase = new UpdateReminderUseCase(repository);

    const result = await useCase.execute({
      reminderId: reminder.id,
      title: "Consulta médica",
      description: "Consulta no cardiologista",
      date: "2026-07-11",
      time: "14:30",
      recurrence: "none",
      recurrenceEndDate: "2026-08-11",
    });

    expect(result.reminder.recurrence).toBe("none");
    expect(result.reminder.recurrenceEndDate).toBeUndefined();
  });

  it("should preserve completed status", async () => {
    const repository = new InMemoryReminderRepository();
    const completedAt = new Date("2026-07-09T11:00:00.000Z");

    const reminder = createReminder({
      completed: true,
      completedAt,
    });

    await repository.create(reminder);

    const useCase = new UpdateReminderUseCase(repository);

    const result = await useCase.execute({
      reminderId: reminder.id,
      title: "Consulta médica",
      description: "Consulta no cardiologista",
      date: "2026-07-11",
      time: "14:30",
      recurrence: "weekly",
      recurrenceEndDate: "2026-08-11",
    });

    expect(result.reminder.completed).toBe(true);
    expect(result.reminder.completedAt).toBe(completedAt);
  });

  it("should throw an error when reminderId is empty", async () => {
    const repository = new InMemoryReminderRepository();
    const useCase = new UpdateReminderUseCase(repository);

    await expect(
      useCase.execute({
        reminderId: "",
        title: "Consulta médica",
        date: "2026-07-11",
      }),
    ).rejects.toThrow("Lembrete é obrigatório.");
  });

  it("should throw an error when title is empty", async () => {
    const repository = new InMemoryReminderRepository();
    const reminder = createReminder();

    await repository.create(reminder);

    const useCase = new UpdateReminderUseCase(repository);

    await expect(
      useCase.execute({
        reminderId: reminder.id,
        title: "",
        date: "2026-07-11",
      }),
    ).rejects.toThrow("Título do lembrete é obrigatório.");
  });

  it("should throw an error when date is empty", async () => {
    const repository = new InMemoryReminderRepository();
    const reminder = createReminder();

    await repository.create(reminder);

    const useCase = new UpdateReminderUseCase(repository);

    await expect(
      useCase.execute({
        reminderId: reminder.id,
        title: "Consulta médica",
        date: "",
      }),
    ).rejects.toThrow("Data do lembrete é obrigatória.");
  });

  it("should throw an error when reminder does not exist", async () => {
    const repository = new InMemoryReminderRepository();
    const useCase = new UpdateReminderUseCase(repository);

    await expect(
      useCase.execute({
        reminderId: "not-found",
        title: "Consulta médica",
        date: "2026-07-11",
      }),
    ).rejects.toThrow("Lembrete não encontrado.");
  });
});