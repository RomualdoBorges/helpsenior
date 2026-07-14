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
import {
  Alert,
  Button,
  FilterBar,
  PageHeader,
  SummaryCard,
} from "../shared/ui";

interface TasksPageUser {
  id: string;
}

interface TasksPageProps {
  user: TasksPageUser;
}

export function TasksPage({ user }: TasksPageProps) {
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
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

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
    <section
      className="mx-auto mt-8 w-full max-w-7xl"
      aria-labelledby="tasks-title">
      <PageHeader
        titleId="tasks-title"
        title="Minhas tarefas"
        description="Crie tarefas simples para acompanhar atividades importantes do dia a dia."
        action={
          <Button
            type="button"
            size="lg"
            onClick={() => setIsCreateTaskOpen(true)}>
            Nova tarefa
          </Button>
        }
      />

      <div className="accessibility-summary mt-6 grid gap-4 md:grid-cols-2">
        <SummaryCard label="Pendentes" value={taskSummary.pending} />
        <SummaryCard
          label="Concluídas"
          value={taskSummary.completed}
          tone="success"
        />
      </div>

      <CreateTaskForm
        isOpen={isCreateTaskOpen}
        isCreating={isCreating}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreateTask={createTask}
      />

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}

      <div className="accessibility-panel mt-6 rounded-2xl">
        <FilterBar
          title="Lista de tarefas"
          itemLabel="tarefa"
          filterLabel="Filtrar tarefas"
          visibleCount={filteredTasks.length}
          totalCount={tasks.length}
          options={taskFilterOptions}
          selectedValue={selectedFilter}
          onChange={setSelectedFilter}
        />

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
    </section>
  );
}
