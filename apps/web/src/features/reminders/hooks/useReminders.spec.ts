import type { Reminder } from "@helpsenior/core";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useReminders } from "./useReminders";

const reminderUseCases = vi.hoisted(() => ({
  complete: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
}));

vi.mock("../../../config/firebase", () => ({
  db: {},
}));

vi.mock("@helpsenior/firebase", () => ({
  FirebaseReminderRepository: class FirebaseReminderRepository {},
}));

vi.mock("@helpsenior/core", async (importOriginal) => {
  const original = await importOriginal<typeof import("@helpsenior/core")>();

  return {
    ...original,
    CompleteReminderUseCase: class CompleteReminderUseCase {
      execute = reminderUseCases.complete;
    },
    CreateReminderUseCase: class CreateReminderUseCase {
      execute = reminderUseCases.create;
    },
    DeleteReminderUseCase: class DeleteReminderUseCase {
      execute = reminderUseCases.delete;
    },
    ListRemindersUseCase: class ListRemindersUseCase {
      execute = reminderUseCases.list;
    },
    UpdateReminderUseCase: class UpdateReminderUseCase {
      execute = reminderUseCases.update;
    },
  };
});

function createReminder(overrides: Partial<Reminder> = {}): Reminder {
  return {
    id: "reminder-1",
    userId: "user-1",
    title: "Lembrete",
    date: "2026-07-27",
    completed: false,
    recurrence: "none",
    createdAt: new Date("2026-07-01T10:00:00"),
    updatedAt: new Date("2026-07-01T10:00:00"),
    ...overrides,
  };
}

describe("useReminders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reminderUseCases.list.mockResolvedValue({ reminders: [] });
    reminderUseCases.create.mockResolvedValue({});
    reminderUseCases.update.mockResolvedValue({});
    reminderUseCases.complete.mockResolvedValue({});
    reminderUseCases.delete.mockResolvedValue(undefined);
  });

  it("carrega e ordena os lembretes do usuário", async () => {
    const later = createReminder({
      id: "later",
      date: "2026-07-30",
    });
    const earlier = createReminder({
      id: "earlier",
      date: "2026-07-28",
    });
    reminderUseCases.list.mockResolvedValue({
      reminders: [later, earlier],
    });

    const { result } = renderHook(() => useReminders("user-1"));

    await waitFor(() => {
      expect(result.current.reminders.map((reminder) => reminder.id)).toEqual([
        "earlier",
        "later",
      ]);
    });
    expect(reminderUseCases.list).toHaveBeenCalledWith({ userId: "user-1" });
    expect(result.current.isLoadingReminders).toBe(false);
  });

  it("cria um lembrete e recarrega a lista", async () => {
    const { result } = renderHook(() => useReminders("user-1"));
    await waitFor(() => expect(reminderUseCases.list).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.createReminder({
        title: "Tomar remédio",
        date: "2026-07-30",
        recurrence: "daily",
      });
    });

    expect(reminderUseCases.create).toHaveBeenCalledWith({
      userId: "user-1",
      title: "Tomar remédio",
      description: undefined,
      date: "2026-07-30",
      time: undefined,
      recurrence: "daily",
      recurrenceEndDate: undefined,
      taskId: undefined,
    });
    expect(reminderUseCases.list).toHaveBeenCalledTimes(2);
    expect(result.current.isCreatingReminder).toBe(false);
  });

  it("atualiza, conclui e exclui recarregando após cada operação", async () => {
    const { result } = renderHook(() => useReminders("user-1"));
    await waitFor(() => expect(reminderUseCases.list).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.updateReminder({
        reminderId: "reminder-1",
        title: "Lembrete atualizado",
        date: "2026-08-01",
      });
      await result.current.completeReminder("reminder-1");
      await result.current.deleteReminder("reminder-1");
    });

    expect(reminderUseCases.update).toHaveBeenCalledWith({
      reminderId: "reminder-1",
      title: "Lembrete atualizado",
      description: undefined,
      date: "2026-08-01",
      time: undefined,
      recurrence: undefined,
      recurrenceEndDate: undefined,
      taskId: undefined,
    });
    expect(reminderUseCases.complete).toHaveBeenCalledWith({
      reminderId: "reminder-1",
    });
    expect(reminderUseCases.delete).toHaveBeenCalledWith({
      reminderId: "reminder-1",
    });
    expect(reminderUseCases.list).toHaveBeenCalledTimes(4);
  });

  it("expõe uma mensagem segura quando o carregamento falha", async () => {
    reminderUseCases.list.mockRejectedValue(new Error("internal detail"));

    const { result } = renderHook(() => useReminders("user-1"));

    await waitFor(() => {
      expect(result.current.remindersError).toBe(
        "Não foi possível carregar os lembretes.",
      );
    });
    expect(result.current.isLoadingReminders).toBe(false);
  });

  it("não carrega nem cria lembretes sem usuário autenticado", async () => {
    const { result } = renderHook(() => useReminders(null));
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
      await result.current.createReminder({
        title: "Não deve criar",
        date: "2026-07-30",
      });
    });

    expect(reminderUseCases.list).not.toHaveBeenCalled();
    expect(reminderUseCases.create).not.toHaveBeenCalled();
    expect(result.current.reminders).toEqual([]);
  });
});
