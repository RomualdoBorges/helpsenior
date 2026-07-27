// import { useState, type FormEvent } from "react";

import type { Activity } from "@helpsenior/core";

import { classNames } from "../../../shared/ui";

interface ActivityListProps {
  activities: Activity[];
  isLoading: boolean;
  emptyMessage?: string;
  onSelectedActivity: (activity: Activity) => void;
}

export function ActivityList({
  activities,
  isLoading,
  emptyMessage = "Nenhuma atividade cadastrada ainda.",
  onSelectedActivity,
}: ActivityListProps) {
  if (isLoading) {
    return (
      <p className="mt-6 text-base font-bold text-slate-600">
        Carregando tarefas...
      </p>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-base font-bold text-slate-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 overflow-y-auto">
      {activities.map((activity) => {
        return (
          <article
            key={activity.id}
            className={classNames(
              "activity-item rounded-2xl border p-5 cursor-pointer",
            )}
            onClick={() => onSelectedActivity(activity)}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="m-0 text-xl font-bold text-slate-950">
                    {activity.title}
                  </h3>
                </div>

                {activity.description && (
                  <p className="mt-2 text-base leading-6 text-slate-600">
                    {activity.description}
                  </p>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
