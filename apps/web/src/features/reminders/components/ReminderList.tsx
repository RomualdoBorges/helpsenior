import { useState, type FormEvent } from "react";

import type { Reminder, ReminderRecurrence } from "@helpsenior/core";

interface UpdateReminderInput {
  reminderId: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  recurrence?: ReminderRecurrence;
  recurrenceEndDate?: string;
}

interface ReminderListProps {
  reminders: Reminder[];
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  emptyMessage?: string;
  onUpdateReminder: (input: UpdateReminderInput) => Promise<void>;
  onCompleteReminder: (reminderId: string) => Promise<void>;
  onDeleteReminder: (reminderId: string) => Promise<void>;
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

function formatDate(date: string) {
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function formatReminderDate(reminder: Reminder) {
  const formattedDate = formatDate(reminder.date);

  if (reminder.time) {
    return `${formattedDate} às ${reminder.time}`;
  }

  return formattedDate;
}

export function ReminderList({
  reminders,
  isLoading,
  isUpdating,
  isDeleting,
  emptyMessage = "Nenhum lembrete cadastrado ainda.",
  onUpdateReminder,
  onCompleteReminder,
  onDeleteReminder,
}: ReminderListProps) {
  const [editingReminderId, setEditingReminderId] = useState<string | null>(
    null,
  );
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingDate, setEditingDate] = useState("");
  const [editingTime, setEditingTime] = useState("");
  const [editingRecurrence, setEditingRecurrence] =
    useState<ReminderRecurrence>("none");
  const [editingRecurrenceEndDate, setEditingRecurrenceEndDate] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

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

  function startEditingReminder(reminder: Reminder) {
    if (reminder.completed) {
      return;
    }

    setEditingReminderId(reminder.id);
    setEditingTitle(reminder.title);
    setEditingDescription(reminder.description ?? "");
    setEditingDate(reminder.date);
    setEditingTime(reminder.time ?? "");
    setEditingRecurrence(reminder.recurrence);
    setEditingRecurrenceEndDate(reminder.recurrenceEndDate ?? "");
    setLocalError(null);
  }

  function cancelEditingReminder() {
    setEditingReminderId(null);
    setEditingTitle("");
    setEditingDescription("");
    setEditingDate("");
    setEditingTime("");
    setEditingRecurrence("none");
    setEditingRecurrenceEndDate("");
    setLocalError(null);
  }

  async function handleUpdateReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLocalError(null);

    if (!editingReminderId) {
      return;
    }

    if (!editingTitle.trim()) {
      setLocalError("Informe o título do lembrete.");
      return;
    }

    if (!editingDate) {
      setLocalError("Informe a data do lembrete.");
      return;
    }

    await onUpdateReminder({
      reminderId: editingReminderId,
      title: editingTitle.trim(),
      description: editingDescription.trim() || undefined,
      date: editingDate,
      time: editingTime || undefined,
      recurrence: editingRecurrence,
      recurrenceEndDate:
        editingRecurrence !== "none"
          ? editingRecurrenceEndDate || undefined
          : undefined,
    });

    cancelEditingReminder();
  }

  function handleDeleteReminder(reminder: Reminder) {
    const shouldDelete = window.confirm(
      `Deseja excluir o lembrete "${reminder.title}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    void onDeleteReminder(reminder.id);
  }

  return (
    <div className="mt-6 grid gap-4">
      {reminders.map((reminder) => {
        const isEditing = editingReminderId === reminder.id;

        return (
          <article
            key={reminder.id}
            className={`reminder-item rounded-2xl border p-5 ${
              reminder.completed
                ? "reminder-item-completed border-slate-200 bg-slate-100 opacity-70"
                : "border-slate-300 bg-white"
            }`}
          >
            {isEditing ? (
              <form onSubmit={handleUpdateReminder} className="grid gap-4">
                <div className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="font-bold text-slate-700">Título</span>

                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
                      required
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="font-bold text-slate-700">Descrição</span>

                    <textarea
                      value={editingDescription}
                      onChange={(event) =>
                        setEditingDescription(event.target.value)
                      }
                      className="min-h-24 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none focus:border-slate-950"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="font-bold text-slate-700">Data</span>

                      <input
                        type="date"
                        value={editingDate}
                        onChange={(event) => setEditingDate(event.target.value)}
                        className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
                        required
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="font-bold text-slate-700">Horário</span>

                      <input
                        type="time"
                        value={editingTime}
                        onChange={(event) => setEditingTime(event.target.value)}
                        className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="font-bold text-slate-700">
                        Recorrência
                      </span>

                      <select
                        value={editingRecurrence}
                        onChange={(event) => {
                          const recurrence = event.target
                            .value as ReminderRecurrence;

                          setEditingRecurrence(recurrence);

                          if (recurrence === "none") {
                            setEditingRecurrenceEndDate("");
                          }
                        }}
                        className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
                      >
                        <option value="none">Sem recorrência</option>
                        <option value="daily">Todos os dias</option>
                        <option value="weekly">Toda semana</option>
                        <option value="monthly">Todo mês</option>
                      </select>
                    </label>

                    {editingRecurrence !== "none" && (
                      <label className="grid gap-2">
                        <span className="font-bold text-slate-700">
                          Repetir até
                        </span>

                        <input
                          type="date"
                          value={editingRecurrenceEndDate}
                          onChange={(event) =>
                            setEditingRecurrenceEndDate(event.target.value)
                          }
                          className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
                        />
                      </label>
                    )}
                  </div>

                  {localError && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
                      {localError}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="min-h-11 rounded-xl bg-slate-950 px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdating ? "Salvando..." : "Salvar"}
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditingReminder}
                    disabled={isUpdating}
                    className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="m-0 text-xl font-bold text-slate-950">
                      {reminder.title}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        reminder.completed
                          ? "bg-slate-200 text-slate-600"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {reminder.completed ? "Concluído" : "Pendente"}
                    </span>
                  </div>

                  {reminder.description && (
                    <p className="mt-2 text-base leading-6 text-slate-600">
                      {reminder.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                      {formatReminderDate(reminder)}
                    </span>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                      {getRecurrenceLabel(reminder.recurrence)}
                    </span>

                    {reminder.recurrence !== "none" &&
                      reminder.recurrenceEndDate && (
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-bold text-purple-700">
                          Até {formatDate(reminder.recurrenceEndDate)}
                        </span>
                      )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!reminder.completed && (
                    <button
                      type="button"
                      onClick={() => startEditingReminder(reminder)}
                      disabled={isUpdating || isDeleting}
                      className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Editar
                    </button>
                  )}

                  {!reminder.completed && (
                    <button
                      type="button"
                      onClick={() => void onCompleteReminder(reminder.id)}
                      disabled={isUpdating || isDeleting}
                      className="min-h-11 rounded-xl bg-slate-950 px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Concluir
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteReminder(reminder)}
                    disabled={isUpdating || isDeleting}
                    className="min-h-11 rounded-xl border border-red-200 bg-white px-4 font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}