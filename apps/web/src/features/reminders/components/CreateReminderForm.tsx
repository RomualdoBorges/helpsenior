import { useState } from "react";

import type { Reminder, ReminderRecurrence } from "@helpsenior/core";

import { Button, FormField, Input, Select, Textarea } from "../../../shared/ui";
import type {
  CreateReminderInput,
  UpdateReminderInput,
} from "../hooks/useReminders";

interface CreateReminderFormProps {
  reminder?: Reminder | null;
  isCreating: boolean;
  onCreateReminder: (input: CreateReminderInput) => Promise<void>;
  onUpdateReminder: (input: UpdateReminderInput) => Promise<void>;
}

export function CreateReminderForm({
  reminder,
  isCreating,
  onCreateReminder,
  onUpdateReminder,
}: CreateReminderFormProps) {
  const [title, setTitle] = useState(reminder?.title ?? "");
  const [description, setDescription] = useState(
    reminder?.description ?? "",
  );
  const [date, setDate] = useState(reminder?.date ?? "");
  const [time, setTime] = useState(reminder?.time ?? "");
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>(
    reminder?.recurrence ?? "none",
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(
    reminder?.recurrenceEndDate ?? "",
  );

  function resetForm() {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setRecurrence("none");
    setRecurrenceEndDate("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (reminder) {
      await onUpdateReminder({
        reminderId: reminder.id,
        title,
        description: description.trim() ? description : undefined,
        date,
        time: time.trim() ? time : undefined,
        recurrence,
        taskId: reminder.taskId,
        recurrenceEndDate:
          recurrence !== "none" && recurrenceEndDate.trim()
            ? recurrenceEndDate
            : undefined,
      });
    } else {
      await onCreateReminder({
        title,
        description: description.trim() ? description : undefined,
        date,
        time: time.trim() ? time : undefined,
        recurrence,
        recurrenceEndDate:
          recurrence !== "none" && recurrenceEndDate.trim()
            ? recurrenceEndDate
            : undefined,
      });
    }

    resetForm();
  }

  return (
    <form onSubmit={handleSubmit} className="create-form mt-2">
      <h3
        id="create-reminder"
        className="reminder-form-title m-0 text-xl font-bold text-violet-700"
      >
        {reminder ? "Atualizar lembrete" : "Criar lembrete"}
      </h3>

      <p className="simple-mode-secondary mt-1 text-sm font-bold text-slate-500">
        {reminder
          ? "Atualize os dados do lembrete conforme necessário."
          : "Defina quando deseja receber o aviso e, se precisar, escolha uma recorrência."}
      </p>

      <div className="mt-4 grid gap-4">
        <FormField label="Título">
          <Input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex: Tomar remédio"
            required
          />
        </FormField>

        <FormField label="Descrição">
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex: Tomar o remédio da pressão com água"
          />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Data">
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </FormField>

          <FormField label="Horário">
            <Input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </FormField>
        </div>

        <div className="grid gap-4">
          <FormField label="Recorrência">
            <Select
              className="w-full"
              value={recurrence}
              onChange={(event) =>
                setRecurrence(event.target.value as ReminderRecurrence)
              }>
              <option value="none">Nenhuma recorrência</option>
              <option value="daily">Todos os dias</option>
              <option value="weekly">Toda semana</option>
              <option value="monthly">Todo mês</option>
            </Select>
          </FormField>

          {recurrence !== "none" && (
            <FormField label="Data final da recorrência">
              <Input
                type="date"
                value={recurrenceEndDate}
                onChange={(event) => setRecurrenceEndDate(event.target.value)}
              />
            </FormField>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isCreating}
        size="lg"
        className="reminders-primary-action mb-4 mt-4 w-full">
        {reminder ? "Atualizar lembrete" : "Criar lembrete"}
      </Button>
    </form>
  );
}
