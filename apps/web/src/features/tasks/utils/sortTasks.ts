import type { Task } from "@helpsenior/core";

function getTaskDateTime(task: Task) {
  if (!task.date) {
    return Number.POSITIVE_INFINITY;
  }

  return new Date(`${task.date}T00:00:00`).getTime();
}

function getStatusPriority(task: Task) {
  if (task.completed) {
    return 1;
  }

  return 0;
}

export function sortTasks(tasks: Task[]) {
  return [...tasks].sort((taskA, taskB) => {
    const statusPriorityDifference =
      getStatusPriority(taskA) - getStatusPriority(taskB);

    if (statusPriorityDifference !== 0) {
      return statusPriorityDifference;
    }

    const dateDifference = getTaskDateTime(taskA) - getTaskDateTime(taskB);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return taskB.createdAt.getTime() - taskA.createdAt.getTime();
  });
}
