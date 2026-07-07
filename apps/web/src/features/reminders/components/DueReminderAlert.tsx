import type { Reminder, ReminderRecurrence } from "@helpsenior/core";

interface DueReminderAlertProps {
  reminders: Reminder[];
  onCompleteReminder: (reminderId: string) => Promise<void>;
}

function getRecurrenceLabel(recurrence: ReminderRecurrence) {
  const labels: Record<ReminderRecurrence, string> = {
    none: "Lembrete único",
    daily: "Repete todos os dias",
    weekly: "Repete toda semana",
    monthly: "Repete todo mês",
  };

  return labels[recurrence];
}

function formatReminderDate(reminder: Reminder) {
  if (reminder.time) {
    return `${reminder.date} às ${reminder.time}`;
  }

  return reminder.date;
}

export function DueReminderAlert({
  reminders,
  onCompleteReminder,
}: DueReminderAlertProps) {
  if (reminders.length === 0) {
    return null;
  }

  const firstReminder = reminders[0];
  const remainingRemindersCount = reminders.length - 1;

  return (
    <div className="due-reminder-alert mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="m-0 text-sm font-bold uppercase tracking-[0.08em]">
            Lembrete agora
          </p>

          <h3 className="mt-2 text-2xl font-bold">{firstReminder.title}</h3>

          {firstReminder.description && (
            <p className="mt-2 text-base leading-6">
              {firstReminder.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-amber-900">
              {formatReminderDate(firstReminder)}
            </span>

            <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-amber-900">
              {getRecurrenceLabel(firstReminder.recurrence)}
            </span>

            {firstReminder.recurrence !== "none" &&
              firstReminder.recurrenceEndDate && (
                <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-amber-900">
                  Até {firstReminder.recurrenceEndDate}
                </span>
              )}
          </div>

          {firstReminder.recurrence !== "none" && (
            <p className="mt-3 text-sm font-bold">
              Ao concluir, o próximo lembrete será criado automaticamente.
            </p>
          )}

          {remainingRemindersCount > 0 && (
            <p className="mt-3 text-sm font-bold">
              Existem mais {remainingRemindersCount} lembrete
              {remainingRemindersCount > 1 ? "s" : ""} vencido
              {remainingRemindersCount > 1 ? "s" : ""}.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void onCompleteReminder(firstReminder.id)}
          className="min-h-11 rounded-xl bg-amber-950 px-4 font-bold text-white">
          Concluir
        </button>
      </div>
    </div>
  );
}
