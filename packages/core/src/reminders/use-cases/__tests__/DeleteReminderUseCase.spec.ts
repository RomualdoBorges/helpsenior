import type { Reminder } from "../../entities/Reminder";

import { describe, expect, it } from "vitest";

import { InMemoryReminderRepository } from "../../in-memory/InMemoryReminderRepository";
import { DeleteReminderUseCase } from "../DeleteReminderUseCase";

function createReminder(overrides?: Partial<Reminder>): Reminder {
  const now = new Date();

  return {
    id: "reminder-1",
    userId: "user-1",
    title: "Tomar remédio",
    date: "2026-07-10",
    completed: false,
    recurrence: "none",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("DeleteReminderUseCase", () => {
  it("should delete a reminder", async () => {
    const repository = new InMemoryReminderRepository();
    const reminder = createReminder();

    await repository.create(reminder);

    const useCase = new DeleteReminderUseCase(repository);

    await useCase.execute({
      reminderId: reminder.id,
    });

    const deletedReminder = await repository.findById(reminder.id);

    expect(deletedReminder).toBeNull();
  });

  it("should not delete other reminders", async () => {
    const repository = new InMemoryReminderRepository();

    const reminderToDelete = createReminder({
      id: "reminder-1",
      title: "Tomar remédio",
    });

    const reminderToKeep = createReminder({
      id: "reminder-2",
      title: "Consulta médica",
    });

    await repository.create(reminderToDelete);
    await repository.create(reminderToKeep);

    const useCase = new DeleteReminderUseCase(repository);

    await useCase.execute({
      reminderId: reminderToDelete.id,
    });

    const deletedReminder = await repository.findById(reminderToDelete.id);
    const keptReminder = await repository.findById(reminderToKeep.id);

    expect(deletedReminder).toBeNull();
    expect(keptReminder).toEqual(reminderToKeep);
  });

  it("should throw an error when reminderId is empty", async () => {
    const repository = new InMemoryReminderRepository();
    const useCase = new DeleteReminderUseCase(repository);

    await expect(
      useCase.execute({
        reminderId: "",
      }),
    ).rejects.toThrow("Lembrete é obrigatório.");
  });

  it("should throw an error when reminder does not exist", async () => {
    const repository = new InMemoryReminderRepository();
    const useCase = new DeleteReminderUseCase(repository);

    await expect(
      useCase.execute({
        reminderId: "not-found",
      }),
    ).rejects.toThrow("Lembrete não encontrado.");
  });
});