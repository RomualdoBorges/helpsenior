import type { Task } from "@helpsenior/core";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  emptyMessage?: string;
  onCompleteTask: (taskId: string) => Promise<void>;
  onCompleteTaskStep: (taskId: string, stepId: string) => Promise<void>;
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

  if (task.status === "in_progress") {
    return "Em andamento";
  }

  return "Pendente";
}

function getTaskStatusClassName(task: Task) {
  if (task.completed) {
    return "bg-green-100 text-green-800";
  }

  if (task.status === "in_progress") {
    return "bg-blue-100 text-blue-800";
  }

  return "bg-amber-100 text-amber-800";
}

export function TaskList({
  tasks,
  isLoading,
  emptyMessage = "Nenhuma tarefa cadastrada ainda.",
  onCompleteTask,
  onCompleteTaskStep,
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
            }`}
          >
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

                <div className="mt-4 flex flex-wrap gap-2">
                  {taskDate && (
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-bold text-purple-700">
                      {taskDate}
                    </span>
                  )}

                  {task.steps.length > 0 && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                      {task.steps.length} etapa
                      {task.steps.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
              </div>

              {!task.completed && (
                <button
                  type="button"
                  onClick={() => void onCompleteTask(task.id)}
                  className="min-h-11 rounded-xl bg-slate-950 px-4 font-bold text-white"
                >
                  Concluir
                </button>
              )}
            </div>

            {task.steps.length > 0 && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="m-0 font-bold text-slate-950">Etapas</h4>

                <ol className="mt-3 grid gap-3">
                  {task.steps.map((step) => (
                    <li
                      key={step.id}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-bold text-slate-950">
                            {step.order}. {step.title}
                          </p>

                          {step.description && (
                            <p className="mt-1 text-sm text-slate-500">
                              {step.description}
                            </p>
                          )}

                          {step.completed && (
                            <p className="mt-2 text-sm font-bold text-green-700">
                              Etapa concluída
                            </p>
                          )}
                        </div>

                        {!step.completed && !task.completed && (
                          <button
                            type="button"
                            onClick={() =>
                              void onCompleteTaskStep(task.id, step.id)
                            }
                            className="min-h-10 rounded-xl border border-slate-300 bg-white px-4 font-bold text-slate-700"
                          >
                            Concluir etapa
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}