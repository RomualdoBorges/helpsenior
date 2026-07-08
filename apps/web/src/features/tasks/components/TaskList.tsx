import type { Task } from "@helpsenior/core";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  isDeleting: boolean;
  emptyMessage?: string;
  onCompleteTask: (taskId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

function formatTaskDate(date?: string) {
  if (!date) {
    return null;
  }

  const [year, month, day] = date.split("-");

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
  isDeleting,
  emptyMessage = "Nenhuma tarefa cadastrada ainda.",
  onCompleteTask,
  onDeleteTask,
}: TaskListProps) {
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

        return (
          <article
            key={task.id}
            className={`task-item rounded-2xl border p-5 ${
              task.completed
                ? "task-item-completed border-slate-200 bg-slate-100 opacity-70"
                : "border-slate-300 bg-white"
            }`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="m-0 text-xl font-bold text-slate-950">
                    {task.title}
                  </h3>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getTaskStatusClassName(
                      task,
                    )}`}>
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
                    onClick={() => void onCompleteTask(task.id)}
                    className="min-h-11 rounded-xl bg-slate-950 px-4 font-bold text-white">
                    Concluir
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteTask(task)}
                  disabled={isDeleting}
                  className="min-h-11 rounded-xl border border-red-200 bg-white px-4 font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">
                  Excluir
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
