import { useState, type FormEvent } from "react";

import type { ReminderRecurrence } from "@helpsenior/core";

import {
  Alert,
  FormField,
  Input,
  ModalForm,
  Select,
  Textarea,
} from "../../../shared/ui";

interface CreateReminderInput {
  title: string;
  description?: string;
  date: string;
  time?: string;
  recurrence?: ReminderRecurrence;
  recurrenceEndDate?: string;
}

interface CreateReminderFormProps {
  isOpen: boolean;
  isCreating: boolean;
  onClose: () => void;
  onCreateReminder: (input: CreateReminderInput) => Promise<boolean>;
}

export function CreateReminderForm({
  isOpen,
  isCreating,
  onClose,
  onCreateReminder,
}: CreateReminderFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>("none");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function resetForm() {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setRecurrence("none");
    setRecurrenceEndDate("");
    setLocalError(null);
  }

  function closeForm() {
    resetForm();
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const wasCreated = await onCreateReminder({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time: time || undefined,
      recurrence,
      recurrenceEndDate:
        recurrence !== "none" && recurrenceEndDate
          ? recurrenceEndDate
          : undefined,
    });

    if (wasCreated) {
      closeForm();
    } else {
      setLocalError("Não foi possível criar o lembrete. Tente novamente.");
    }
  }

  return (
    <ModalForm
      isOpen={isOpen}
      isSubmitting={isCreating}
      onClose={closeForm}
      onSubmit={handleSubmit}
      titleId="create-reminder-title"
      title="Criar lembrete"
      descriptionId="create-reminder-description"
      description="Escolha quando deseja receber o aviso e se ele deve se repetir."
      submitLabel="Criar lembrete"
      busyLabel="Criando lembrete..."
      maxWidth="2xl"
      className="create-reminder-dialog">
      <FormField label="Título">
        <Input
          autoFocus
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

      {localError && <Alert tone="error">{localError}</Alert>}
    </ModalForm>
  );
}
