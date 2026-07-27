import { useEffect, useState } from "react";

import type { Reminder, ReminderRecurrence, Task } from "@helpsenior/core";

import {
  Button,
  FormField,
  Input,
  Select,
  Textarea,
} from "../../../shared/ui";
import type { CreateReminderInput, UpdateReminderInput } from "../hooks/useReminders";
import { TaskSelect } from "../../tasks/components/TaskSelect";

interface CreateReminderFormProps {
  reminder?: Reminder | null;
  tasks: Task[];
  isCreating: boolean;
  onCreateReminder: (input: CreateReminderInput) => Promise<void>;
  onUpdateReminder: (input: UpdateReminderInput) => Promise<void>;
}

export function CreateReminderForm({
  reminder,
  tasks,
  isCreating,
  onCreateReminder,
  onUpdateReminder,
}: CreateReminderFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>("none");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [taskId, setTaskId] = useState("");

  function resetForm() {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setRecurrence("none");
    setRecurrenceEndDate("");
    setTaskId("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    
    if(reminder) {
      await onUpdateReminder({
        reminderId: reminder.id,
        title,
        description: description.trim() ? description : undefined,
        date,
        time: time.trim() ? time : undefined,
        recurrence,
        taskId: taskId,
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
        taskId: taskId,
        recurrenceEndDate:
          recurrence !== "none" && recurrenceEndDate.trim()
            ? recurrenceEndDate
            : undefined,
      });
    }

    resetForm();
  }
      
  useEffect(() => {
    if (reminder) {
      setTitle(reminder.title);
      setDate(reminder.date);
      
      if (reminder.description)
        setDescription(reminder.description);

      if (reminder.time)
        setTime(reminder.time);

      if (reminder.recurrence)
        setRecurrence(reminder.recurrence);

      if (reminder.recurrenceEndDate)
        setRecurrenceEndDate(reminder.recurrenceEndDate);

      if (reminder.taskId)
        setTaskId(reminder.taskId);
    }
  }, [reminder]);

  return (
    <form
      onSubmit={handleSubmit}
      className="create-form mt-1">
      <h3 className="reminder-form-title m-0 text-xl font-bold text-violet-700">
        {reminder ? "Atualizar lembrete" : "Criar lembrete"}
      </h3>

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
        
        <FormField label="Tarefa (opcional)">
          <TaskSelect
            value={taskId}
            tasks={tasks}
            onSelected={setTaskId}
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
        className="reminders-primary-action mt-4">
        {reminder ? "Atualizar lembrete" : "Criar lembrete"}
      </Button>
    </form>
  );
}
