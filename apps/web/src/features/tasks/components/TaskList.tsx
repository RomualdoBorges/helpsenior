import type { Task } from "@helpsenior/core";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onCompleteTask: (taskId: string) => Promise<void>;
  onCompleteTaskStep: (taskId: string, stepId: string) => Promise<void>;
}

export function TaskList({
  tasks,
  isLoading,
  onCompleteTask,
  onCompleteTaskStep,
}: TaskListProps) {
  if (isLoading) {
    return <p className="mt-6 text-slate-600">Carregando tarefas...</p>;
  }

  if (tasks.length === 0) {
    return <p className="mt-6 text-slate-600">Nenhuma tarefa criada ainda.</p>;
  }

  return (
    <ul className="mt-6 flex list-none flex-col gap-3 p-0">
      {tasks.map((task) => {
        const isCompleted = task.status === "completed";
        const hasSteps = task.steps.length > 0;
        const completedSteps = task.steps.filter(
          (step) => step.completed,
        ).length;

        return (
          <li
            key={task.id}
            className={[
              "task-item rounded-2xl border p-4",
              isCompleted
                ? "task-item-completed border-green-200 bg-green-50"
                : "border-slate-300 bg-white",
            ]
              .filter(Boolean)
              .join(" ")}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <strong className="block text-slate-950">{task.title}</strong>

                <p
                  className={[
                    "mt-2",
                    isCompleted ? "text-green-700" : "text-slate-500",
                  ]
                    .filter(Boolean)
                    .join(" ")}>
                  Status: {isCompleted ? "concluída" : "pendente"}
                </p>

                {hasSteps && (
                  <p className="mt-1.5 text-sm text-slate-500">
                    Etapas: {completedSteps} de {task.steps.length} concluídas
                  </p>
                )}
              </div>

              {!isCompleted && (
                <button
                  type="button"
                  onClick={() => void onCompleteTask(task.id)}
                  className="min-h-10 rounded-[10px] border-0 bg-green-700 px-4 font-bold text-white">
                  Concluir tarefa
                </button>
              )}
            </div>

            {hasSteps && (
              <ol className="mt-4 flex list-decimal flex-col gap-2.5 pl-5">
                {task.steps
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((step) => {
                    const isStepCompleted = step.completed;

                    return (
                      <li
                        key={step.id}
                        className={
                          isStepCompleted ? "text-green-700" : "text-slate-600"
                        }>
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className={
                              isStepCompleted ? "line-through" : undefined
                            }>
                            {step.title}
                          </span>

                          {isStepCompleted ? (
                            <span className="text-sm font-bold text-green-700">
                              Concluída
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                void onCompleteTaskStep(task.id, step.id)
                              }
                              className="min-h-8.5 rounded-lg border border-green-700 bg-white px-3 text-sm font-bold text-green-700">
                              Concluir etapa
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
              </ol>
            )}
          </li>
        );
      })}
    </ul>
  );
}
