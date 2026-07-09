import { useState, type FormEvent } from "react";

import { Alert, Button, FormField, Input, Textarea } from "../../../shared/ui";

interface CreateTaskInput {
  title: string;
  description?: string;
  date?: string;
}

interface CreateTaskFormProps {
  isCreating: boolean;
  onCreateTask: (input: CreateTaskInput) => Promise<void>;
}

export function CreateTaskForm({
  isCreating,
  onCreateTask,
}: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function resetForm() {
    setTitle("");
    setDescription("");
    setDate("");
    setLocalError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLocalError(null);

    if (!title.trim()) {
      setLocalError("Informe o título da tarefa.");
      return;
    }

    await onCreateTask({
      title: title.trim(),
      description: description.trim() || undefined,
      date: date || undefined,
    });

    resetForm();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="m-0 text-xl font-bold text-slate-950">Criar tarefa</h3>

      <p className="mt-1 text-sm font-bold text-slate-500">
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

        <FormField label="Data">
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </FormField>

        {localError && <Alert tone="error">{localError}</Alert>}
      </div>

      <Button
        type="submit"
        disabled={isCreating}
        size="lg"
        className="mt-4">
        {isCreating ? "Criando tarefa..." : "Criar tarefa"}
      </Button>
    </form>
  );
}
