import { useState } from "react";

import type { ReminderRecurrence } from "@helpsenior/core";

import {
  Button,
  FormField,
  Input,
  Select,
  Textarea,
} from "../../../shared/ui";

interface CreateReminderFormProps {
  isCreating: boolean;
  onCreateReminder: (input: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    recurrence?: ReminderRecurrence;
    recurrenceEndDate?: string;
  }) => Promise<void>;
}

export function CreateReminderForm({
  isCreating,
  onCreateReminder,
}: CreateReminderFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>("none");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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

    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setRecurrence("none");
    setRecurrenceEndDate("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="m-0 text-xl font-bold text-slate-950">Criar lembrete</h3>

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

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Recorrência">
            <Select
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
        className="mt-4">
        {isCreating ? "Criando lembrete..." : "Criar lembrete"}
      </Button>
    </form>
  );
}
