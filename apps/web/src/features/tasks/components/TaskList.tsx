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
  onSelectedTask: (task: Task) => void;
  onActivityDetail: (activityId: string) => Promise<void>;
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
  onActivityDetail,
  onSelectedTask,
}: TaskListProps) {

  const activityTitle = (activityId: string) => activities.find((activity) => activityId === activity.id)?.title || "";

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
            className={classNames(
              "task-item rounded-2xl border p-5",
              task.completed
                ? "task-item-completed border-slate-200 bg-slate-100 opacity-70"
                : "border-slate-300 bg-white",
            )}
          >
              <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                <div style={{width: "stretch"}} onClick={() => onSelectedTask(task)}>
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
                      <span className="flex items-center gap-1.5 text-sm font-bold text-violet-700">
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

                  {/* {task.activityId && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge tone="slate">{activityTitle(task.activityId)}</Badge>
                    </div>
                  )} */}
                </div>

                <div style={{height: "stretch"}} className="flex flex-col min-w-auto justify-between">
                  <div className="flex flex-col">                    
                    {task.activityId && (
                      <>
                        <p className="text-sm text-center font-bold leading-6 text-black-600">
                          Atividade anexada
                        </p>
                          
                        <div className="flex flex-wrap justify-center gap-2 cursor-pointer" onClick={() => onActivityDetail(task.activityId!)}>
                          <Badge tone="slate" className="text-lg text-center">{activityTitle(task.activityId)}</Badge>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-end mt-4">
                    {!task.completed && (
                      <Button
                        type="button"
                        onClick={() => void onCompleteTask(task.id)}
                      >
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
