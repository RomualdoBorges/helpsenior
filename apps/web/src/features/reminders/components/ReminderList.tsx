import type { Reminder, ReminderRecurrence } from "@helpsenior/core";

import {
  Badge,
  Button,
  classNames,
} from "../../../shared/ui";
import { formatDisplayDate } from "../../../shared/utils/formatDisplayDate";

interface ReminderListProps {
  reminders: Reminder[];
  isLoading: boolean;
  emptyMessage?: string;
  onCompleteReminder: (reminderId: string) => Promise<void>;
  onSelectedReminder: (reminder: Reminder) => void;
  onTaskDetail: (taskId: string) => Promise<void>;
}

function getRecurrenceLabel(recurrence: ReminderRecurrence) {
  const labels: Record<ReminderRecurrence, string> = {
    none: "Sem recorrência",
    daily: "Todos os dias",
    weekly: "Toda semana",
    monthly: "Todo mês",
  };

  return labels[recurrence];
}

function formatReminderDate(reminder: Reminder) {
  const formattedDate = formatDisplayDate(reminder.date);

  if (reminder.time) {
    return `${formattedDate} às ${reminder.time}`;
  }

  return formattedDate;
}

export function ReminderList({
  reminders,
  isLoading,
  emptyMessage = "Nenhum lembrete cadastrado ainda.",
  onCompleteReminder,
  onSelectedReminder,
  onTaskDetail,
}: ReminderListProps) {

  if (isLoading) {
    return (
      <p className="mt-6 text-base font-bold text-slate-600">
        Carregando lembretes...
      </p>
    );
  }

  if (reminders.length === 0) {
    return (
      <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-base font-bold text-slate-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-4">
      {reminders.map((reminder) => {

        return (
          <article
            key={reminder.id}
            className={classNames(
              "reminder-item rounded-2xl border p-5",
              reminder.completed
                ? "reminder-item-completed border-slate-200 bg-slate-100 opacity-70"
                : "border-slate-300 bg-white",
            )}
          >
            <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
              <div style={{width: "stretch"}}
                onClick={() => {
                  // if (!reminder.completed) {
                    onSelectedReminder(reminder)
                  // }
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="m-0 text-xl font-bold text-slate-950">
                    {reminder.title}
                  </h3>

                  <Badge
                    tone={reminder.completed ? "slate" : "amber"}
                    className={classNames(
                      "text-xs",
                      reminder.completed && "bg-slate-200 text-slate-600",
                    )}
                  >
                    {reminder.completed ? "Concluído" : "Pendente"}
                  </Badge>
                </div>

                {reminder.description && (
                  <p className="mt-2 text-base leading-6 text-slate-600">
                    {reminder.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-violet-700">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M8 3v4M16 3v4M3 10h18" />
                    </svg>
                    {formatReminderDate(reminder)}
                  </span>

                  <Badge tone="blue">
                    {getRecurrenceLabel(reminder.recurrence)}
                  </Badge>

                  {reminder.recurrence !== "none" &&
                    reminder.recurrenceEndDate && (
                      <Badge tone="purple">
                        Até {formatDisplayDate(reminder.recurrenceEndDate)}
                      </Badge>
                    )}
                </div>
              </div>

              <div style={{height: "stretch"}} className="flex flex-col min-w-fit gap-2 justify-between">
                { !reminder.completed && (
                  <Button
                    type="button"
                    onClick={() => void onCompleteReminder(reminder.id)}
                  >
                    Concluir
                  </Button>
                )}
                { reminder.taskId && (
                  <Button
                    type="button"
                    onClick={() => onTaskDetail(reminder.taskId!)}
                    variant="danger"
                  >
                    Ver Tarefa
                  </Button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
