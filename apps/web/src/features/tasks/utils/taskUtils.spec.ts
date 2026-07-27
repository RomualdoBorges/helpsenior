import type { Task } from "@helpsenior/core";
import { describe, expect, it } from "vitest";
import { sortTasks } from "./sortTasks";
import {
  filterTasks,
  getTaskFilterOptions,
  getTaskSummary,
  type TaskFilter,
} from "./taskFilters";

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    userId: "user-1",
    title: "Tarefa",
    status: "pending",
    completed: false,
    createdAt: new Date("2026-01-01T10:00:00"),
    updatedAt: new Date("2026-01-01T10:00:00"),
    ...overrides,
  };
}

describe("sortTasks", () => {
  it("ordena pendentes antes das concluídas", () => {
    const completed = createTask({
      id: "completed",
      status: "completed",
      completed: true,
      date: "2025-01-01",
    });
    const pending = createTask({ id: "pending", date: "2026-12-01" });

    expect(sortTasks([completed, pending]).map((task) => task.id)).toEqual([
      "pending",
      "completed",
    ]);
  });

  it("ordena tarefas do mesmo status pela data mais próxima", () => {
    const later = createTask({ id: "later", date: "2026-08-20" });
    const earlier = createTask({ id: "earlier", date: "2026-08-10" });
    const withoutDate = createTask({ id: "without-date" });

    expect(
      sortTasks([withoutDate, later, earlier]).map((task) => task.id),
    ).toEqual(["earlier", "later", "without-date"]);
  });

  it("usa a criação mais recente como desempate sem alterar a lista original", () => {
    const older = createTask({
      id: "older",
      createdAt: new Date("2026-01-01T10:00:00"),
    });
    const newer = createTask({
      id: "newer",
      createdAt: new Date("2026-01-02T10:00:00"),
    });
    const tasks = [older, newer];

    expect(sortTasks(tasks).map((task) => task.id)).toEqual(["newer", "older"]);
    expect(tasks.map((task) => task.id)).toEqual(["older", "newer"]);
  });
});

describe("taskFilters", () => {
  const tasks = [
    createTask({ id: "pending", date: "2026-08-10" }),
    createTask({
      id: "completed",
      status: "completed",
      completed: true,
    }),
    createTask({ id: "without-date" }),
  ];

  it("resume as quantidades das tarefas", () => {
    expect(getTaskSummary(tasks)).toEqual({
      total: 3,
      pending: 2,
      completed: 1,
      withDate: 1,
    });
  });

  it.each<[TaskFilter, string[]]>([
    ["all", ["pending", "completed", "without-date"]],
    ["pending", ["pending", "without-date"]],
    ["completed", ["completed"]],
    ["with_date", ["pending"]],
  ])("aplica o filtro %s", (filter, expectedIds) => {
    expect(filterTasks(tasks, filter).map((task) => task.id)).toEqual(
      expectedIds,
    );
  });

  it("cria as opções com contadores e mensagens apropriados", () => {
    const options = getTaskFilterOptions(getTaskSummary(tasks));

    expect(options.map(({ value, count }) => ({ value, count }))).toEqual([
      { value: "all", count: 3 },
      { value: "pending", count: 2 },
      { value: "completed", count: 1 },
      { value: "with_date", count: 1 },
    ]);
    expect(options.every((option) => option.emptyMessage.length > 0)).toBe(
      true,
    );
  });
});
