import type { Activity, Task } from "@helpsenior/core";

import {
  Badge,
  Button,
  classNames,
} from "../../../shared/ui";
import { formatDisplayDate } from "../../../shared/utils/formatDisplayDate";

interface TaskListProps {
  tasks: Task[];
  activities: Activity[];
  isLoading: boolean;
  emptyMessage?: string;
  onCompleteTask: (taskId: string) => Promise<void>;
  onDeleteTask: (task: Task) => Promise<void>;
  onEditTask: (task: Task) => void;
}

function formatTaskDate(date?: string) {
  if (!date) {
    return null;
  }

  return formatDisplayDate(date);
}

function getTaskStatusLabel(task: Task) {
  if (task.completed) {
    return "Concluída";
  }

  return "Pendente";
}

export function TaskList({
  tasks,
  activities,
  isLoading,
  emptyMessage = "Nenhuma tarefa cadastrada ainda.",
  onCompleteTask,
  onDeleteTask,
  onEditTask,
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
      <p className="task-empty-state mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-base font-bold text-slate-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-4 pb-6">
      {tasks.map((task) => {
        const taskDate = formatTaskDate(task.date);
        const linkedActivity = task.activityId
          ? activities.find((activity) => activity.id === task.activityId)
          : undefined;

        return (
          <article
            key={task.id}
            className={classNames(
              "task-item rounded-2xl border p-5 transition-colors",
              task.completed
                ? "task-item-completed border-slate-200 bg-slate-100 opacity-70"
                : "border-slate-300 bg-white hover:border-violet-500",
            )}
          >
              <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="task-item-title m-0 text-xl font-bold text-violet-700">
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
                      <span className="task-date flex items-center gap-1.5 text-sm font-bold text-violet-700">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="size-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <rect x="3" y="5" width="18" height="16" rx="2" />
                          <path d="M8 3v4M16 3v4M3 10h18" />
                        </svg>
                        {taskDate}
                      </span>
                    </div>
                  )}

                  {linkedActivity && (
                    <section
                      className="mt-4"
                      aria-label={`Atividade anexada: ${linkedActivity.title}`}
                    >
                      <h4 className="activity-steps-title m-0 text-base font-bold text-slate-800">
                        Passo a passo
                      </h4>

                      <ol className="mt-2 space-y-2">
                        {[...linkedActivity.steps]
                          .sort((firstStep, secondStep) => {
                            return firstStep.order - secondStep.order;
                          })
                          .map((step) => (
                            <li
                              key={step.order}
                              className="flex items-start gap-3 text-base leading-6 text-slate-600"
                            >
                              <span
                                aria-hidden="true"
                                className="activity-step-number flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700"
                              >
                                {step.order}
                              </span>
                              <span>{step.description}</span>
                            </li>
                          ))}
                      </ol>
                    </section>
                  )}
                </div>

                <div className="flex shrink-0 flex-col justify-between">
                  <div className="mt-4 flex flex-wrap justify-end gap-2 md:mt-0">
                    {!task.completed && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="inline-flex items-center gap-2"
                        onClick={() => onEditTask(task)}
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="size-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                        </svg>
                        Editar
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      className="inline-flex items-center gap-2"
                      onClick={() => void onDeleteTask(task)}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6 18 20H6L5 6" />
                        <path d="M10 11v5M14 11v5" />
                      </svg>
                      Excluir
                    </Button>
                    {!task.completed && (
                      <Button
                        type="button"
                        size="sm"
                        className="tasks-primary-action inline-flex items-center gap-2"
                        onClick={() => void onCompleteTask(task.id)}
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="size-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m5 12 4 4L19 6" />
                        </svg>
                        Concluir
                      </Button>
                    )}
                  </div>
                </div>
              </div>
          </article>
        );
      })}
    </div>
  );
}
