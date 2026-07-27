import { useEffect, useState, type FormEvent } from "react";
import type { Activity, Task } from "@helpsenior/core";

import { Alert, Button, FormField, Input, Textarea } from "../../../shared/ui";
import { ActivitySelect } from "../../activities/components/ActivitySelect";
import type { CreateTaskInput, UpdateTaskInput } from "../hooks/useTasks";

interface CreateTaskFormProps {
  isCreating: boolean;
  task?: Task | null;
  activities: Activity[];
  onCreateTask: (input: CreateTaskInput) => Promise<void>;
  onUpdateTask: (input: UpdateTaskInput) => Promise<void>;
}

export function CreateTaskForm({
  isCreating,
  task,
  activities,
  onCreateTask,
  onUpdateTask,
}: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [activityId, setActivityId] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function resetForm() {
    setTitle("");
    setDescription("");
    setDate("");
    setActivityId("");
    setLocalError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLocalError(null);

    if (!title.trim()) {
      setLocalError("Informe o título da tarefa.");
      return;
    }

    if(task) {
      await onUpdateTask({
        taskId: task.id,
        title: title.trim(),
        description: description.trim() || undefined,
        date: date || undefined,
        activityId: activityId || undefined,
      })

    } else {
      await onCreateTask({
        title: title.trim(),
        description: description.trim() || undefined,
        date: date || undefined,
        activityId: activityId || undefined,
      });
    }

    resetForm();
  }
    
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setLocalError(null);
      
      if (task.description)
        setDescription(task.description);

      if (task.date)
        setDate(task.date);

      if (task.activityId)
        setActivityId(task.activityId);
    }
  }, [task]);

  return (
    <form
      onSubmit={handleSubmit}
      className="create-form mt-4">
      <h3 className="m-0 text-xl font-bold text-slate-950">Criar tarefa</h3>

      <p className="simple-mode-secondary mt-1 text-sm font-bold text-slate-500">
        Use tarefas para registrar o que precisa ser feito. Para avisos,
        horários e repetição, use a área de lembretes.
      </p>

      <div className="mt-4 grid gap-4">
        <FormField label="Título">
          <Input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex: Pagar conta de luz"
            required
          />
        </FormField>

        <FormField label="Descrição">
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex: Pagar a conta antes do vencimento"
          />
        </FormField>

        <FormField label="Data (opcional)">
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </FormField>

        <FormField label="Atividade (opcional)">
          <ActivitySelect
            value={activityId}
            activities={activities}
            onSelected={setActivityId}
          />
        </FormField>

        {localError && <Alert tone="error">{localError}</Alert>}
      </div>

      <Button
        type="submit"
        disabled={isCreating}
        size="lg"
        className="mt-4">
        {task ? "Atualizar tarefa" : "Criar tarefa"}
      </Button>
    </form>
  );
}
