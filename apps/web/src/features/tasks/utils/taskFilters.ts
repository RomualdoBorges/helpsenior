import type { Task } from "@helpsenior/core";

export type TaskFilter = "all" | "pending" | "in_progress" | "completed" | "with_date";

export interface TaskFilterOption {
  value: TaskFilter;
  label: string;
  count: number;
  emptyMessage: string;
}

export interface TaskSummary {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  withDate: number;
}

export function getTaskSummary(tasks: Task[]): TaskSummary {
  return tasks.reduce<TaskSummary>(
    (summary, task) => {
      summary.total += 1;

      if (task.completed) {
        summary.completed += 1;
      } else if (task.status === "in_progress") {
        summary.inProgress += 1;
      } else {
        summary.pending += 1;
      }

      if (task.date) {
        summary.withDate += 1;
      }

      return summary;
    },
    {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      withDate: 0,
    },
  );
}

export function filterTasks(tasks: Task[], filter: TaskFilter) {
  if (filter === "all") {
    return tasks;
  }

  if (filter === "pending") {
    return tasks.filter((task) => !task.completed && task.status === "pending");
  }

  if (filter === "in_progress") {
    return tasks.filter(
      (task) => !task.completed && task.status === "in_progress",
    );
  }

  if (filter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks.filter((task) => Boolean(task.date));
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
      value: "in_progress",
      label: "Em andamento",
      count: summary.inProgress,
      emptyMessage: "Nenhuma tarefa em andamento.",
    },
    {
      value: "completed",
      label: "Concluídas",
      count: summary.completed,
      emptyMessage: "Nenhuma tarefa concluída.",
    },
    {
      value: "with_date",
      label: "Com data",
      count: summary.withDate,
      emptyMessage: "Nenhuma tarefa com data.",
    },
  ];
}