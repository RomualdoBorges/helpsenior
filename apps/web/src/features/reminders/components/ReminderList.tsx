import { useState, type FormEvent } from "react";

import type { Reminder, ReminderRecurrence } from "@helpsenior/core";

import {
  Alert,
  Badge,
  Button,
  FormField,
  Input,
  Select,
  Textarea,
  classNames,
} from "../../../shared/ui";

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
            className={classNames(
              "reminder-item rounded-2xl border p-5",
              reminder.completed
                ? "reminder-item-completed border-slate-200 bg-slate-100 opacity-70"
                : "border-slate-300 bg-white",
            )}
          >
            {isEditing ? (
              <form onSubmit={handleUpdateReminder} className="grid gap-4">
                <div className="grid gap-4">
                  <FormField label="Título">
                    <Input
                      type="text"
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      required
                    />
                  </FormField>

                  <FormField label="Descrição">
                    <Textarea
                      value={editingDescription}
                      onChange={(event) =>
                        setEditingDescription(event.target.value)
                      }
                    />
                  </FormField>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Data">
                      <Input
                        type="date"
                        value={editingDate}
                        onChange={(event) => setEditingDate(event.target.value)}
                        required
                      />
                    </FormField>

                    <FormField label="Horário">
                      <Input
                        type="time"
                        value={editingTime}
                        onChange={(event) => setEditingTime(event.target.value)}
                      />
                    </FormField>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Recorrência">
                      <Select
                        value={editingRecurrence}
                        onChange={(event) => {
                          const recurrence = event.target
                            .value as ReminderRecurrence;

                          setEditingRecurrence(recurrence);

                          if (recurrence === "none") {
                            setEditingRecurrenceEndDate("");
                          }
                        }}
                      >
                        <option value="none">Sem recorrência</option>
                        <option value="daily">Todos os dias</option>
                        <option value="weekly">Toda semana</option>
                        <option value="monthly">Todo mês</option>
                      </Select>
                    </FormField>

                    {editingRecurrence !== "none" && (
                      <FormField label="Repetir até">
                        <Input
                          type="date"
                          value={editingRecurrenceEndDate}
                          onChange={(event) =>
                            setEditingRecurrenceEndDate(event.target.value)
                          }
                        />
                      </FormField>
                    )}
                  </div>

                  {localError && <Alert tone="error">{localError}</Alert>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Salvando..." : "Salvar"}
                  </Button>

                  <Button
                    type="button"
                    onClick={cancelEditingReminder}
                    disabled={isUpdating}
                    variant="secondary"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
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
                    <Badge>{formatReminderDate(reminder)}</Badge>

                    <Badge tone="blue">
                      {getRecurrenceLabel(reminder.recurrence)}
                    </Badge>

                    {reminder.recurrence !== "none" &&
                      reminder.recurrenceEndDate && (
                        <Badge tone="purple">
                          Até {formatDate(reminder.recurrenceEndDate)}
                        </Badge>
                      )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!reminder.completed && (
                    <Button
                      type="button"
                      onClick={() => startEditingReminder(reminder)}
                      disabled={isUpdating || isDeleting}
                      variant="secondary"
                    >
                      Editar
                    </Button>
                  )}

                  {!reminder.completed && (
                    <Button
                      type="button"
                      onClick={() => void onCompleteReminder(reminder.id)}
                      disabled={isUpdating || isDeleting}
                    >
                      Concluir
                    </Button>
                  )}

                  <Button
                    type="button"
                    onClick={() => handleDeleteReminder(reminder)}
                    disabled={isUpdating || isDeleting}
                    variant="danger"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
