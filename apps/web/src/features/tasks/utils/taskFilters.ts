import type { Task } from "@helpsenior/core";

export type TaskFilter = "all" | "pending" | "completed";

export interface TaskFilterOption {
  value: TaskFilter;
  label: string;
  count: number;
  emptyMessage: string;
}

export interface TaskSummary {
  total: number;
  pending: number;
  completed: number;
}

export function getTaskSummary(tasks: Task[]): TaskSummary {
  return tasks.reduce<TaskSummary>(
    (summary, task) => {
      summary.total += 1;

      if (task.completed) {
        summary.completed += 1;
      } else {
        summary.pending += 1;
      }

      return summary;
    },
    {
      total: 0,
      pending: 0,
      completed: 0,
    },
  );
}

export function filterTasks(tasks: Task[], filter: TaskFilter) {
  if (filter === "all") {
    return tasks;
  }

  if (filter === "pending") {
    return tasks.filter((task) => !task.completed);
  }

  return tasks.filter((task) => task.completed);
}

export function getTaskFilterOptions(summary: TaskSummary): TaskFilterOption[] {
  return [
    {
      value: "all",
      label: "Todas",
      count: summary.total,
      emptyMessage: "Nenhuma tarefa cadastrada ainda.",
    },
    {
      value: "pending",
      label: "Pendentes",
      count: summary.pending,
      emptyMessage: "Nenhuma tarefa pendente.",
    },
    {
      value: "completed",
      label: "Concluídas",
      count: summary.completed,
      emptyMessage: "Nenhuma tarefa concluída.",
    },
  ];
}
