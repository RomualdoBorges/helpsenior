import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { CreateTaskForm } from "../features/tasks/components/CreateTaskForm";
import { TaskList } from "../features/tasks/components/TaskList";
import {
  useTasks,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "../features/tasks/hooks/useTasks";
import { useActivities } from "../features/activities/hooks/useActivities";
import {
  filterTasks,
  getTaskFilterOptions,
  getTaskSummary,
  type TaskFilter,
} from "../features/tasks/utils/taskFilters";
import { Alert, BigNumberCard, Button, Card, FilterTabs } from "../shared/ui";
import type { Task } from "@helpsenior/core";
import { TaskDetail } from "../features/tasks/components/TaskDetail";

interface TaskPageUser {
  id: string;
}

interface TaskPageProps {
  user: TaskPageUser;
}

export function TaskPage({ user }: TaskPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const taskId = location.state?.taskId;

  const { activities } = useActivities(user.id);
  const {
    tasks,
    isLoading,
    isCreating,
    error,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
  } = useTasks(user.id);

  const [selectedFilter, setSelectedFilter] = useState<TaskFilter>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskStatus, setTaskStatus] = useState<"creating" | "updating" | "">(
    "",
  );

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

  async function handleActivityDetail(activityId: string) {
    navigate("/", {
      state: { activityId },
    });
  }

  async function handleCreateTask(task: CreateTaskInput) {
    await createTask(task);
    setTaskStatus("");
    setSelectedTask(null);
  }

  async function handleUpdateTask(task: UpdateTaskInput) {
    await updateTask(task);
    setTaskStatus("");
    setSelectedTask(null);
  }

  async function handleDeleteTask(task: Task) {
    const shouldDelete = window.confirm(
      `Deseja excluir a tarefa "${task.title}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    await deleteTask(task.id);
    setSelectedTask(null);
  }

  useEffect(() => {
    if (taskId) {
      const task = tasks.find((task) => task.id === taskId);
      setSelectedTask(task!);
    }
  }, [taskId, tasks]);

  return (
    <>
      {!selectedTask && taskStatus === "" ? (
        <Card as="section" className="mt-8" aria-labelledby="tasks-title">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="tasks-title" className="m-0 text-[28px] font-bold">
                Minhas tarefas
              </h2>

              <p className="simple-mode-secondary mt-0 text-base leading-6 text-slate-500">
                Crie tarefas simples para acompanhar atividades importantes do
                dia a dia.
              </p>
            </div>

            <Button
              size="sm"
              variant="primary"
              className="flex shrink-0 items-center justify-center gap-2"
              onClick={() => setTaskStatus("creating")}>
              <span aria-hidden="true" className="text-xl leading-none">
                +
              </span>
              Nova tarefa
            </Button>
          </div>

          <div className="accessibility-summary mt-6 grid gap-4 md:grid-cols-3">
            <BigNumberCard
              label="Pendentes"
              value={taskSummary.pending}
              tone="violet"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <rect x="6" y="4" width="12" height="17" rx="2" />
                  <path d="M9 4.5V3h6v1.5M9 9h6M9 13h6M9 17h4" />
                </svg>
              }
            />
            <BigNumberCard
              label="Concluídas"
              value={taskSummary.completed}
              tone="green"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m8 12 2.5 2.5L16 9" />
                </svg>
              }
            />
            <BigNumberCard
              label="Com data"
              value={taskSummary.withDate}
              tone="violet"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M8 3v4M16 3v4M3 10h18" />
                </svg>
              }
            />
          </div>

          {error && (
            <Alert tone="error" className="mt-4">
              {error}
            </Alert>
          )}

          <div className="accessibility-panel mt-6 rounded-2xl">
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

              <div className="w-full md:w-auto">
                <FilterTabs
                  ariaLabel="Filtrar tarefas"
                  options={taskFilterOptions}
                  value={selectedFilter}
                  onChange={setSelectedFilter}
                />
              </div>
            </div>

            <TaskList
              tasks={filteredTasks}
              activities={activities}
              isLoading={isLoading}
              emptyMessage={
                selectedFilterOption?.emptyMessage ??
                "Nenhuma tarefa encontrada."
              }
              onCompleteTask={completeTask}
              onSelectedTask={setSelectedTask}
              onActivityDetail={handleActivityDetail}
            />
          </div>
        </Card>
      ) : (
        <div>
          <Card as="section" className="mt-4" aria-labelledby="create-task">
            <div className="flex md:justify-between">
              {!taskId ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSelectedTask(null);
                    setTaskStatus("");
                  }}>
                  Voltar para a lista
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSelectedTask(null);
                    setTaskStatus("");
                    navigate("/lembretes");
                  }}>
                  Voltar para Lembretes
                </Button>
              )}

              {taskStatus === "" && (
                <div className="block md:flex md:gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setTaskStatus("updating");
                    }}>
                    Editar Tarefa
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteTask(selectedTask!)}>
                    Excluir Tarefa
                  </Button>
                </div>
              )}
              {taskStatus === "updating" && (
                <div className="block md:flex md:gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setTaskStatus("");
                    }}>
                    Sair da edição de tarefa
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <Alert tone="error" className="mt-4">
                {error}
              </Alert>
            )}

            {taskStatus === "" ? (
              <div>
                <Card
                  as="section"
                  className="mt-8"
                  aria-labelledby="activities-title">
                  <TaskDetail
                    activities={activities}
                    task={selectedTask!}
                    isLoading={isLoading}
                  />
                </Card>
              </div>
            ) : (
              <div>
                <Card
                  as="section"
                  className="mt-8"
                  aria-labelledby="create-form">
                  <CreateTaskForm
                    task={selectedTask}
                    activities={activities}
                    isCreating={isCreating}
                    onCreateTask={handleCreateTask}
                    onUpdateTask={handleUpdateTask}
                  />
                </Card>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
