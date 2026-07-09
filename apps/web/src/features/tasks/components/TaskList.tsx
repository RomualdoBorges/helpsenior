import { useState, type FormEvent } from "react";

import type { Task } from "@helpsenior/core";

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

function getTaskStatusClassName(task: Task) {
  if (task.completed) {
    return "bg-green-100 text-green-800";
  }

  return "bg-amber-100 text-amber-800";
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
            className={`task-item rounded-2xl border p-5 ${
              task.completed
                ? "task-item-completed border-slate-200 bg-slate-100 opacity-70"
                : "border-slate-300 bg-white"
            }`}
          >
            {isEditing ? (
              <form onSubmit={handleUpdateTask} className="grid gap-4">
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

                  <label className="grid gap-2">
                    <span className="font-bold text-slate-700">Data</span>

                    <input
                      type="date"
                      value={editingDate}
                      onChange={(event) => setEditingDate(event.target.value)}
                      className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none focus:border-slate-950"
                    />
                  </label>

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
                    onClick={cancelEditingTask}
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
                      {task.title}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getTaskStatusClassName(
                        task,
                      )}`}
                    >
                      {getTaskStatusLabel(task)}
                    </span>
                  </div>

                  {task.description && (
                    <p className="mt-2 text-base leading-6 text-slate-600">
                      {task.description}
                    </p>
                  )}

                  {taskDate && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-bold text-purple-700">
                        {taskDate}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {!task.completed && (
                    <button
                      type="button"
                      onClick={() => startEditingTask(task)}
                      disabled={isUpdating || isDeleting}
                      className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Editar
                    </button>
                  )}

                  {!task.completed && (
                    <button
                      type="button"
                      onClick={() => void onCompleteTask(task.id)}
                      disabled={isUpdating || isDeleting}
                      className="min-h-11 rounded-xl bg-slate-950 px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Concluir
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task)}
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