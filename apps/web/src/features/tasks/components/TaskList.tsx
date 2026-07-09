import { useState, type FormEvent } from "react";

import type { Task } from "@helpsenior/core";

import {
  Alert,
  Badge,
  Button,
  FormField,
  Input,
  Textarea,
  classNames,
} from "../../../shared/ui";

interface UpdateTaskInput {
  taskId: string;
  title: string;
  description?: string;
  date?: string;
}

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  emptyMessage?: string;
  onUpdateTask: (input: UpdateTaskInput) => Promise<void>;
  onCompleteTask: (taskId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

function formatTaskDate(date?: string) {
  if (!date) {
    return null;
  }

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function getTaskStatusLabel(task: Task) {
  if (task.completed) {
    return "Concluída";
  }

  return "Pendente";
}

export function TaskList({
  tasks,
  isLoading,
  isUpdating,
  isDeleting,
  emptyMessage = "Nenhuma tarefa cadastrada ainda.",
  onUpdateTask,
  onCompleteTask,
  onDeleteTask,
}: TaskListProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingDate, setEditingDate] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <p className="mt-6 text-base font-bold text-slate-600">
        Carregando tarefas...
      </p>
    );
  }

  if (tasks.length === 0) {
    return (
      <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-base font-bold text-slate-500">
        {emptyMessage}
      </p>
    );
  }

  function startEditingTask(task: Task) {
    if (task.completed) {
      return;
    }

    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingDescription(task.description ?? "");
    setEditingDate(task.date ?? "");
    setLocalError(null);
  }

  function cancelEditingTask() {
    setEditingTaskId(null);
    setEditingTitle("");
    setEditingDescription("");
    setEditingDate("");
    setLocalError(null);
  }

  async function handleUpdateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLocalError(null);

    if (!editingTaskId) {
      return;
    }

    if (!editingTitle.trim()) {
      setLocalError("Informe o título da tarefa.");
      return;
    }

    await onUpdateTask({
      taskId: editingTaskId,
      title: editingTitle.trim(),
      description: editingDescription.trim() || undefined,
      date: editingDate || undefined,
    });

    cancelEditingTask();
  }

  function handleDeleteTask(task: Task) {
    const shouldDelete = window.confirm(
      `Deseja excluir a tarefa "${task.title}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    void onDeleteTask(task.id);
  }

  return (
    <div className="mt-6 grid gap-4">
      {tasks.map((task) => {
        const taskDate = formatTaskDate(task.date);
        const isEditing = editingTaskId === task.id;

        return (
          <article
            key={task.id}
            className={classNames(
              "task-item rounded-2xl border p-5",
              task.completed
                ? "task-item-completed border-slate-200 bg-slate-100 opacity-70"
                : "border-slate-300 bg-white",
            )}
          >
            {isEditing ? (
              <form onSubmit={handleUpdateTask} className="grid gap-4">
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

                  <FormField label="Data">
                    <Input
                      type="date"
                      value={editingDate}
                      onChange={(event) => setEditingDate(event.target.value)}
                    />
                  </FormField>

                  {localError && <Alert tone="error">{localError}</Alert>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Salvando..." : "Salvar"}
                  </Button>

                  <Button
                    type="button"
                    disabled={isUpdating}
                    onClick={cancelEditingTask}
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
                      {task.title}
                    </h3>

                    <Badge
                      tone={task.completed ? "green" : "amber"}
                      className="text-xs"
                    >
                      {getTaskStatusLabel(task)}
                    </Badge>
                  </div>

                  {task.description && (
                    <p className="mt-2 text-base leading-6 text-slate-600">
                      {task.description}
                    </p>
                  )}

                  {taskDate && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge tone="purple">{taskDate}</Badge>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {!task.completed && (
                    <Button
                      type="button"
                      onClick={() => startEditingTask(task)}
                      disabled={isUpdating || isDeleting}
                      variant="secondary"
                    >
                      Editar
                    </Button>
                  )}

                  {!task.completed && (
                    <Button
                      type="button"
                      onClick={() => void onCompleteTask(task.id)}
                      disabled={isUpdating || isDeleting}
                    >
                      Concluir
                    </Button>
                  )}

                  <Button
                    type="button"
                    onClick={() => handleDeleteTask(task)}
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
