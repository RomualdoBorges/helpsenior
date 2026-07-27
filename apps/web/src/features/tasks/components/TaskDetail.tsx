import type { Activity, Task } from "@helpsenior/core";

import { formatDisplayDate } from "../../../shared/utils/formatDisplayDate";

interface TaskDetailProps {
  task: Task,
  activities: Activity[],
  isLoading: boolean,
}

export function TaskDetail({
  task,
  activities,
  isLoading,
}: TaskDetailProps) {
  const activityTitle = (activityId: string) => activities.find((activity) => activityId === activity.id)?.title || "";

  if (isLoading) {
    return (
      <p className="mt-6 text-base font-bold text-slate-600">
        Carregando Tarefa...
      </p>
    );
  }

  return (
    <>
    <div>
      <h2
        id="activities-title"
        className="tasks-page-title m-0 text-[28px] font-bold text-violet-700">
        {task.title}
      </h2>

      { task.description && (
        <p className="simple-mode-secondary mt-2 text-base font-bold leading-6 text-slate-500">
          {task.description}
        </p>
      )}

      { task.date && (
        <p className="simple-mode-secondary mt-2 text-base font-bold leading-6 text-slate-500">
          {formatDisplayDate(task.date)}
        </p>
      )}

      { task.activityId && (
        <p className="simple-mode-secondary mt-2 text-base font-bold leading-6 text-slate-500">
          {activityTitle(task.activityId)}
        </p>
      )}
    </div>
    </>
  );
}
