import type { Reminder } from "@helpsenior/core";
import { describe, expect, it } from "vitest";
import { getDueReminders } from "./getDueReminders";
import { sortReminders } from "./sortReminders";

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

describe("getDueReminders", () => {
  const now = new Date("2026-07-27T12:00:00");

  it("retorna lembretes pendentes que já chegaram ao horário", () => {
    const due = createReminder({ id: "due", time: "11:59" });
    const exact = createReminder({ id: "exact", time: "12:00" });
    const future = createReminder({ id: "future", time: "12:01" });

    expect(
      getDueReminders([due, exact, future], now).map(
        (reminder) => reminder.id,
      ),
    ).toEqual(["due", "exact"]);
  });

  it("considera meia-noite quando o lembrete não tem horário", () => {
    const reminder = createReminder({ id: "without-time" });

    expect(getDueReminders([reminder], now)).toEqual([reminder]);
  });

  it("ignora lembretes concluídos mesmo que estejam vencidos", () => {
    const completed = createReminder({
      completed: true,
      date: "2026-07-26",
    });

    expect(getDueReminders([completed], now)).toEqual([]);
  });
});

describe("sortReminders", () => {
  it("ordena pendentes cronologicamente antes dos concluídos", () => {
    const completed = createReminder({
      id: "completed",
      completed: true,
      date: "2026-07-20",
    });
    const later = createReminder({
      id: "later",
      date: "2026-07-28",
      time: "10:00",
    });
    const earlier = createReminder({
      id: "earlier",
      date: "2026-07-27",
      time: "18:00",
    });

    expect(
      sortReminders([completed, later, earlier]).map(
        (reminder) => reminder.id,
      ),
    ).toEqual(["earlier", "later", "completed"]);
  });

  it("ordena concluídos pela atualização mais recente", () => {
    const older = createReminder({
      id: "older",
      completed: true,
      updatedAt: new Date("2026-07-25T10:00:00"),
    });
    const newer = createReminder({
      id: "newer",
      completed: true,
      updatedAt: new Date("2026-07-26T10:00:00"),
    });
    const reminders = [older, newer];

    expect(sortReminders(reminders).map((reminder) => reminder.id)).toEqual([
      "newer",
      "older",
    ]);
    expect(reminders.map((reminder) => reminder.id)).toEqual([
      "older",
      "newer",
    ]);
  });
});
