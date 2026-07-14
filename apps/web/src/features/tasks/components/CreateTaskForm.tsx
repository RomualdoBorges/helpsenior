import { useState, type FormEvent } from "react";

import {
  Alert,
  FormField,
  Input,
  ModalForm,
  Textarea,
} from "../../../shared/ui";

interface CreateTaskInput {
  title: string;
  description?: string;
  date: string;
}

interface CreateTaskFormProps {
  isOpen: boolean;
  isCreating: boolean;
  onClose: () => void;
  onCreateTask: (input: CreateTaskInput) => Promise<boolean>;
}

export function CreateTaskForm({
  isOpen,
  isCreating,
  onClose,
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

  function closeForm() {
    resetForm();
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLocalError(null);

    if (!title.trim()) {
      setLocalError("Informe o título da tarefa.");
      return;
    }

    if (!date) {
      setLocalError("Informe a data da tarefa.");
      return;
    }

    const wasCreated = await onCreateTask({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
    });

    if (wasCreated) {
      closeForm();
    } else {
      setLocalError("Não foi possível criar a tarefa. Tente novamente.");
    }
  }

  return (
    <ModalForm
      isOpen={isOpen}
      isSubmitting={isCreating}
      onClose={closeForm}
      onSubmit={handleSubmit}
      titleId="create-task-title"
      title="Criar tarefa"
      descriptionId="create-task-description"
      description="Registre o que precisa ser feito. Para avisos, horários e repetição, use a área de lembretes."
      submitLabel="Criar tarefa"
      busyLabel="Criando tarefa..."
      className="create-task-dialog">
      <FormField label="Título">
        <Input
          autoFocus
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
          required
        />
      </FormField>

      {localError && <Alert tone="error">{localError}</Alert>}
    </ModalForm>
  );
}
