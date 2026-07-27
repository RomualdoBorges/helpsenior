// import { useState, type FormEvent } from "react";

import type { Activity } from "@helpsenior/core";

import { Button } from "../../../shared/ui";

interface ActivityListProps {
  activities: Activity[];
  isLoading: boolean;
  isDeleting: boolean;
  emptyMessage?: string;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activity: Activity) => void;
}

export function ActivityList({
  activities,
  isLoading,
  isDeleting,
  emptyMessage = "Nenhuma atividade cadastrada ainda.",
  onEditActivity,
  onDeleteActivity,
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
    <div className="grid grid-cols-1 gap-6 overflow-y-auto pb-6">
      {activities.map((activity) => {
        return (
          <article
            key={activity.id}
            className="activity-item rounded-2xl border border-slate-300 bg-white p-5 transition-colors hover:border-violet-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="activity-item-title m-0 text-xl font-bold text-violet-700">
                    {activity.title}
                  </h3>
                </div>

                {activity.description && (
                  <p className="mt-2 text-base leading-6 text-slate-600">
                    {activity.description}
                  </p>
                )}

                <div className="mt-4">
                  <h4 className="activity-steps-title m-0 text-base font-bold text-slate-800">
                    Passo a passo
                  </h4>

                  <ol className="mt-2 space-y-2">
                    {[...activity.steps]
                      .sort((firstStep, secondStep) => {
                        return firstStep.order - secondStep.order;
                      })
                      .map((step) => (
                        <li
                          key={step.order}
                          className="flex items-start gap-3 text-base leading-6 text-slate-600">
                          <span
                            aria-hidden="true"
                            className="activity-step-number flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                            {step.order}
                          </span>
                          <span>{step.description}</span>
                        </li>
                      ))}
                  </ol>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="inline-flex items-center gap-2"
                  aria-label={`Editar atividade ${activity.title}`}
                  onClick={() => {
                    onEditActivity(activity);
                  }}>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                  </svg>
                  Editar
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  className="inline-flex items-center gap-2"
                  disabled={isDeleting}
                  aria-label={`Excluir atividade ${activity.title}`}
                  onClick={() => {
                    onDeleteActivity(activity);
                  }}>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6 18 20H6L5 6" />
                    <path d="M10 11v5M14 11v5" />
                  </svg>
                  Excluir
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
