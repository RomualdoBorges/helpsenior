import { useMemo, useState } from "react";

import { CreateTaskForm } from "../features/tasks/components/CreateTaskForm";
import { TaskList } from "../features/tasks/components/TaskList";
import { useTasks } from "../features/tasks/hooks/useTasks";
import {
  filterTasks,
  getTaskFilterOptions,
  getTaskSummary,
  type TaskFilter,
} from "../features/tasks/utils/taskFilters";
import { Alert, Button, Card } from "../shared/ui";

interface HomePageUser {
  id: string;
}

interface HomePageProps {
  user: HomePageUser;
}

export function HomePage({ user }: HomePageProps) {
  const {
    tasks,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
  } = useTasks(user.id);

  const [selectedFilter, setSelectedFilter] = useState<TaskFilter>("all");

  const taskSummary = useMemo(() => getTaskSummary(tasks), [tasks]);

  const taskFilterOptions = useMemo(
    () => getTaskFilterOptions(taskSummary),
    [taskSummary],
  );

  const filteredTasks = useMemo(
    () => filterTasks(tasks, selectedFilter),
    [selectedFilter, tasks],
  );

  const selectedFilterOption = taskFilterOptions.find(
    (option) => option.value === selectedFilter,
  );

  return (
    <Card as="section" className="mt-8" aria-labelledby="tasks-title">
      <div>
        <h2 id="tasks-title" className="m-0 text-[28px] font-bold">
          Minhas tarefas
        </h2>

        <p className="mt-2 text-base leading-6 text-slate-500">
          Crie tarefas simples para acompanhar atividades importantes do dia a
          dia.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="m-0 text-sm font-bold text-slate-600">Pendentes</p>

          <strong className="mt-2 block text-3xl text-slate-950">
            {taskSummary.pending}
          </strong>
        </article>

        <article className="rounded-2xl border border-green-200 bg-green-50 p-4">
          <p className="m-0 text-sm font-bold text-green-700">Concluídas</p>

          <strong className="mt-2 block text-3xl text-green-950">
            {taskSummary.completed}
          </strong>
        </article>

        <article className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
          <p className="m-0 text-sm font-bold text-purple-700">Com data</p>

          <strong className="mt-2 block text-3xl text-purple-950">
            {taskSummary.withDate}
          </strong>
        </article>
      </div>

      <CreateTaskForm isCreating={isCreating} onCreateTask={createTask} />

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="m-0 text-xl font-bold text-slate-950">
              Lista de tarefas
            </h3>

            <p className="mt-1 text-sm font-bold text-slate-500">
              {filteredTasks.length} de {tasks.length} tarefa
              {tasks.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {taskFilterOptions.map((filter) => {
              const isSelected = selectedFilter === filter.value;

              return (
                <Button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedFilter(filter.value)}
                  size="sm"
                  variant={isSelected ? "primary" : "secondary"}
                  className="rounded-full"
                >
                  {filter.label} ({filter.count})
                </Button>
              );
            })}
          </div>
        </div>

        <TaskList
          tasks={filteredTasks}
          isLoading={isLoading}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
          emptyMessage={
            selectedFilterOption?.emptyMessage ?? "Nenhuma tarefa encontrada."
          }
          onUpdateTask={updateTask}
          onCompleteTask={completeTask}
          onDeleteTask={deleteTask}
        />
      </div>
    </Card>
  );
}
