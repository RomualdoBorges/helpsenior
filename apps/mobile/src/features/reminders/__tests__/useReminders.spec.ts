import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Reminder } from "@helpsenior/core";

import { useReminders } from "../useReminders";

const useCaseMocks = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  complete: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("@helpsenior/firebase", () => ({
  FirebaseReminderRepository: class FirebaseReminderRepository {},
}));

vi.mock("@helpsenior/core", async (importOriginal) => {
  const original = await importOriginal<typeof import("@helpsenior/core")>();

  return {
    ...original,
    ListRemindersUseCase: class ListRemindersUseCase {
      execute = useCaseMocks.list;
    },
    CreateReminderUseCase: class CreateReminderUseCase {
      execute = useCaseMocks.create;
    },
    UpdateReminderUseCase: class UpdateReminderUseCase {
      execute = useCaseMocks.update;
    },
    CompleteReminderUseCase: class CompleteReminderUseCase {
      execute = useCaseMocks.complete;
    },
    DeleteReminderUseCase: class DeleteReminderUseCase {
      execute = useCaseMocks.delete;
    },
  };
});

vi.mock("@/src/config/firebase", () => ({ db: {} }));

function createReminder(input: Partial<Reminder> & { id: string }): Reminder {
  return {
    id: input.id,
    userId: "user-1",
    title: input.title ?? input.id,
    date: input.date ?? "2026-08-01",
    time: input.time,
    completed: input.completed ?? false,
    recurrence: input.recurrence ?? "none",
    createdAt: input.createdAt ?? new Date("2026-07-01T12:00:00"),
    updatedAt: input.updatedAt ?? new Date("2026-07-01T12:00:00"),
  };
}

describe("useReminders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCaseMocks.list.mockResolvedValue({ reminders: [] });
    useCaseMocks.create.mockResolvedValue({});
    useCaseMocks.update.mockResolvedValue({});
    useCaseMocks.complete.mockResolvedValue({});
    useCaseMocks.delete.mockResolvedValue({});
  });

  it("ordena lembretes pendentes por data e horário", async () => {
    useCaseMocks.list.mockResolvedValue({
      reminders: [
        createReminder({ id: "completed", completed: true }),
        createReminder({ id: "later", date: "2026-08-02", time: "08:00" }),
        createReminder({ id: "first", date: "2026-08-01", time: "14:00" }),
      ],
    });

    const { result } = renderHook(() => useReminders("user-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.reminders.map((reminder) => reminder.id)).toEqual([
      "first",
      "later",
      "completed",
    ]);
  });

  it("conclui e exclui lembretes recarregando a lista", async () => {
    const { result } = renderHook(() => useReminders("user-1"));
    await waitFor(() => expect(useCaseMocks.list).toHaveBeenCalledTimes(1));

    await act(async () => {
      expect(await result.current.completeReminder("reminder-1")).toBe(true);
      expect(await result.current.deleteReminder("reminder-1")).toBe(true);
    });

    expect(useCaseMocks.complete).toHaveBeenCalledWith({
      reminderId: "reminder-1",
    });
    expect(useCaseMocks.delete).toHaveBeenCalledWith({
      reminderId: "reminder-1",
    });
    expect(useCaseMocks.list).toHaveBeenCalledTimes(3);
    expect(result.current.isDeleting).toBe(false);
  });

  it("mantém a tela utilizável quando o carregamento falha", async () => {
    useCaseMocks.list.mockRejectedValue({ code: "unavailable" });

    const { result } = renderHook(() => useReminders("user-1"));

    await waitFor(() =>
      expect(result.current.error).toContain("Verifique sua internet"),
    );

    expect(result.current.reminders).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
