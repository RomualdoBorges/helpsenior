import type { Task } from "@helpsenior/core";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
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
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (task.status === "in_progress") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

export function TaskList({
  tasks,
  isLoading,
  onCompleteTask,
  onCompleteTaskStep,
}: TaskListProps) {
  if (isLoading) {
    return (
      <section className="app-card rounded-[24px] border border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgb(15_23_42_/_0.08)]">
        <p className="text-base font-bold text-slate-600">
          Carregando tarefas...
        </p>
      </section>
    );
  }

  if (tasks.length === 0) {
    return (
      <section className="app-card rounded-[24px] border border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgb(15_23_42_/_0.08)]">
        <p className="text-base font-bold text-slate-600">
          Nenhuma tarefa cadastrada ainda.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      {tasks.map((task) => {
        const taskDate = formatTaskDate(task.date);

        return (
          <article
            key={task.id}
            className="app-card rounded-[24px] border border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgb(15_23_42_/_0.08)]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-950">
                    {task.title}
                  </h3>

                  <span
                    className={`rounded-full border px-3 py-1 text-sm font-bold ${getTaskStatusClassName(
                      task,
                    )}`}
                  >
                    {getTaskStatusLabel(task)}
                  </span>
                </div>

                {task.description && (
                  <p className="mt-2 text-base leading-6 text-slate-500">
                    {task.description}
                  </p>
                )}

                {taskDate && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-bold text-slate-600">
                      Data: {taskDate}
                    </span>
                  </div>
                )}
              </div>

              {!task.completed && (
                <button
                  type="button"
                  onClick={() => void onCompleteTask(task.id)}
                  className="min-h-11 rounded-xl bg-slate-950 px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Concluir tarefa
                </button>
              )}
            </div>

            {task.steps.length > 0 && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-bold text-slate-950">Etapas</h4>

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
                            className="min-h-10 rounded-xl border border-slate-300 bg-white px-4 font-bold text-slate-700 hover:border-slate-950 hover:text-slate-950"
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
    </section>
  );
}