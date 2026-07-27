import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { CreateTaskForm } from "../features/tasks/components/CreateTaskForm";
import { TaskList } from "../features/tasks/components/TaskList";
import { useTasks, type CreateTaskInput, type UpdateTaskInput } from "../features/tasks/hooks/useTasks";
import { useActivities } from "../features/activities/hooks/useActivities";
import {
  filterTasks,
  getTaskFilterOptions,
  getTaskSummary,
  type TaskFilter,
} from "../features/tasks/utils/taskFilters";
import { Alert, Button, Card } from "../shared/ui";
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

  const { activities } = useActivities(user.id)
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
  const [taskStatus, setTaskStatus] = useState<"creating" | "updating" | "">("");

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
    setTaskStatus("")
    setSelectedTask(null)
  }
    
  async function handleUpdateTask(task: UpdateTaskInput) {

    await updateTask(task);
    setTaskStatus("")
    setSelectedTask(null)
  }
    
  async function handleDeleteTask(task: Task) {
    const shouldDelete = window.confirm(
      `Deseja excluir a tarefa "${task.title}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    await deleteTask(task.id);
    setSelectedTask(null)
  }
  
  useEffect(() => {
    if (taskId) {
      const task = tasks.find((task) => task.id === taskId)
      setSelectedTask(task!)
    }
  }, [taskId, tasks]);

  return (
    <>
      { !selectedTask && taskStatus === '' ? (
        <Card as="section" className="mt-8" aria-labelledby="tasks-title">
          <div>
            <h2 id="tasks-title" className="m-0 text-[28px] font-bold">
              Minhas tarefas
            </h2>

            <p className="simple-mode-secondary mt-2 text-base leading-6 text-slate-500">
              Crie tarefas simples para acompanhar atividades importantes do dia a
              dia.
            </p>
          </div>

          <div className="accessibility-summary mt-6 grid gap-4 md:grid-cols-3">
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

          {error && (
            <Alert tone="error" className="mt-4">
              {error}
            </Alert>
          )}

          <div className="accessibility-panel mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
              activities={activities}
              isLoading={isLoading}
              emptyMessage={selectedFilterOption?.emptyMessage ?? "Nenhuma tarefa encontrada."}
              onCompleteTask={completeTask}
              onSelectedTask={setSelectedTask}
              onActivityDetail={handleActivityDetail}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <Button size="sm" variant="primary" onClick={() => setTaskStatus('creating')}>
              Criar nova Tarefa
            </Button>
          </div>
        </Card>
        ) : (
          <div>
            <Card as="section" className="mt-4" aria-labelledby="create-task">
              <div className="flex md:justify-between">
                { !taskId ? (
                  <Button size="sm" variant="secondary"
                    onClick={() => {
                      setSelectedTask(null)
                      setTaskStatus('')
                    }}>
                    Voltar para a lista
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary"
                    onClick={() => {
                      setSelectedTask(null)
                      setTaskStatus('')
                      navigate("/lembretes")
                    }}>
                    Voltar para Lembretes
                  </Button>
                )}

                {taskStatus === "" && (
                  <div className="block md:flex md:gap-2">
                    <Button size="sm" variant="secondary" onClick={() => {setTaskStatus('updating')}}>
                      Editar Tarefa
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteTask(selectedTask!)}>
                      Excluir Tarefa
                    </Button>
                  </div>
                )}
                {taskStatus === "updating" && (
                  <div className="block md:flex md:gap-2">
                    <Button size="sm" variant="secondary" onClick={() => {setTaskStatus('')}}>
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

              { taskStatus === "" ? (
                <div>
                  <Card as="section" className="mt-8" aria-labelledby="activities-title">
                    <TaskDetail activities={activities} task={selectedTask!} isLoading={isLoading} />
                  </Card>
                </div>
              ) : (
                <div>
                  <Card as="section" className="mt-8" aria-labelledby="create-form">
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
