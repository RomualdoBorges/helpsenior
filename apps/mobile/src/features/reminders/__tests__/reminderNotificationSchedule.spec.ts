import { describe, expect, it } from "vitest";

import type { Reminder, ReminderRecurrence } from "@helpsenior/core";

import {
  buildReminderNotificationOccurrences,
  DEFAULT_NOTIFICATION_TIME,
} from "../reminderNotificationSchedule";

function createReminder(
  input: Partial<Reminder> & {
    date: string;
    recurrence?: ReminderRecurrence;
  },
): Reminder {
  return {
    id: input.id ?? "reminder-1",
    userId: "user-1",
    title: input.title ?? "Tomar remédio",
    date: input.date,
    time: input.time,
    completed: input.completed ?? false,
    recurrence: input.recurrence ?? "none",
    recurrenceEndDate: input.recurrenceEndDate,
    createdAt: new Date("2026-01-01T12:00:00"),
    updatedAt: new Date("2026-01-01T12:00:00"),
  };
}

function formatLocalDateTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

describe("buildReminderNotificationOccurrences", () => {
  const now = new Date("2026-07-27T10:00:00");

  it("agenda um lembrete futuro na data e horário escolhidos", () => {
    const occurrences = buildReminderNotificationOccurrences(
      [createReminder({ date: "2026-07-28", time: "14:30" })],
      now,
    );

    expect(occurrences).toHaveLength(1);
    expect(formatLocalDateTime(occurrences[0].date)).toBe(
      "2026-07-28T14:30",
    );
  });

  it("usa o horário padrão quando o lembrete não possui horário", () => {
    const occurrences = buildReminderNotificationOccurrences(
      [createReminder({ date: "2026-07-28" })],
      now,
    );

    expect(formatLocalDateTime(occurrences[0].date)).toBe(
      `2026-07-28T${DEFAULT_NOTIFICATION_TIME}`,
    );
  });

  it("ignora lembretes concluídos e não recorrentes vencidos", () => {
    const occurrences = buildReminderNotificationOccurrences(
      [
        createReminder({
          id: "completed",
          date: "2026-07-28",
          completed: true,
        }),
        createReminder({ id: "overdue", date: "2026-07-26" }),
      ],
      now,
    );

    expect(occurrences).toEqual([]);
  });

  it("avança uma recorrência diária vencida para a próxima ocorrência", () => {
    const occurrences = buildReminderNotificationOccurrences(
      [
        createReminder({
          date: "2026-07-25",
          time: "08:00",
          recurrence: "daily",
        }),
      ],
      now,
      2,
    );

    expect(occurrences.map(({ date }) => formatLocalDateTime(date))).toEqual([
      "2026-07-28T08:00",
      "2026-07-29T08:00",
    ]);
  });

  it("respeita a data final da recorrência", () => {
    const occurrences = buildReminderNotificationOccurrences(
      [
        createReminder({
          date: "2026-07-28",
          recurrence: "daily",
          recurrenceEndDate: "2026-07-30",
        }),
      ],
      now,
    );

    expect(occurrences.map(({ date }) => formatLocalDateTime(date))).toEqual([
      "2026-07-28T09:00",
      "2026-07-29T09:00",
      "2026-07-30T09:00",
    ]);
  });

  it("ordena ocorrências de diferentes lembretes e aplica o limite global", () => {
    const occurrences = buildReminderNotificationOccurrences(
      [
        createReminder({ id: "later", date: "2026-07-30" }),
        createReminder({
          id: "daily",
          date: "2026-07-28",
          recurrence: "daily",
        }),
      ],
      now,
      2,
    );

    expect(occurrences.map(({ reminder }) => reminder.id)).toEqual([
      "daily",
      "daily",
    ]);
    expect(occurrences).toHaveLength(2);
  });
});
