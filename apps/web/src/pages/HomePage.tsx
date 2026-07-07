import type { AuthUser } from "@helpsenior/firebase";

import { CreateTaskForm } from "../features/tasks/components/CreateTaskForm";
import { TaskList } from "../features/tasks/components/TaskList";
import { useTasks } from "../features/tasks/hooks/useTasks";

interface HomePageProps {
  user: AuthUser;
}

export function HomePage({ user }: HomePageProps) {
  const {
    tasks,
    isLoading,
    isCreating,
    error,
    createTask,
    completeTask,
    completeTaskStep,
  } = useTasks(user.id);

  return (
    <section
      className="app-card mt-8 rounded-[20px] border border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgb(15_23_42/0.06)]"
      aria-labelledby="tasks-title">
      <h2 id="tasks-title" className="m-0 text-[28px] font-bold">
        Minhas tarefas
      </h2>

      <CreateTaskForm isCreating={isCreating} onCreateTask={createTask} />

      {error && <p className="mt-4 font-bold text-red-700">{error}</p>}

      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        onCompleteTask={completeTask}
        onCompleteTaskStep={completeTaskStep}
      />
    </section>
  );
}
