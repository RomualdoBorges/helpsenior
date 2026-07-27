import { useEffect, useMemo, useState } from "react";
import type { Activity } from "@helpsenior/core";

import { CreateActivityForm } from "../features/activities/components/CreateActivityForm";
import { ActivityList } from "../features/activities/components/ActivityList";
import { ActivityDetail } from "../features/activities/components/ActivityDetail";
import { useActivities, type CreateActivityInput, type UpdateActivityInput } from "../features/activities/hooks/useActivities";
import {
  filterActivities,
} from "../features/activities/utils/filterActivities";
import { Alert, Button, Card, Input } from "../shared/ui";
import { useLocation, useNavigate } from "react-router-dom";

interface ActivityPageUser {
  id: string;
}

interface ActivityPageProps {
  user: ActivityPageUser;
}

export function ActivityPage({ user }: ActivityPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const activityId = location.state?.activityId;

  const {
    activities,
    isLoading,
    isCreating,
    isUpdating,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
  } = useActivities(user.id);

  const [filter, setFilter] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activityStatus, setActivityStatus] = useState<"creating" | "updating" | "">("");

  const filteredActivities = useMemo(
    () => filterActivities(activities, filter),
    [filter, activities],
  );
  
  async function handleCreateActivity(activity: CreateActivityInput) {

    await createActivity(activity);
    setSelectedActivity(null)
    setActivityStatus("")
  }
  
  async function handleUpdateActivity(activity: UpdateActivityInput) {
    const shouldUpdate = window.confirm(
      `Deseja atualizar a atividade "${activity.title}"?`,
    );

    if (!shouldUpdate) {
      return;
    }

    await updateActivity(activity);
    setSelectedActivity(null)
    setActivityStatus("")
  }
  
  async function handleDeleteActivity(activity: Activity) {
    const shouldDelete = window.confirm(
      `Deseja excluir a atividade "${activity.title}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    await deleteActivity(activity.id);
    setSelectedActivity(null)
  }

  useEffect(() => {
    if (activityId) {
      const activity = activities.find((activity) => activity.id === activityId)
      setSelectedActivity(activity!)
    }
  }, [activityId, activities]);

  return (
    <>
      { !selectedActivity && activityStatus === "" ? (
        <div>
          <Card as="section" className="mt-8" aria-labelledby="activities-title">
            <div>
              <h2 id="activities-title" className="m-0 text-[28px] font-bold">
                Minhas atividades
              </h2>

              <p className="simple-mode-secondary mt-2 text-base leading-6 text-slate-500">
                Crie guias simples para acompanhar atividades importantes do dia a dia.
              </p>
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
                    Lista de atividades
                  </h3>

                  <p className="mt-1 text-sm font-bold text-slate-500">
                    {filteredActivities.length} de {activities.length} atividades
                    {activities.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <p className=" text-sm font-bold text-slate-500">
                    Procure por suas atividades
                  </p>
                  <Input
                    type="text"
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    placeholder="Digite algo escrito na atividade desejada"
                    required
                  />
                </div>
              </div>
              <div>
                <Card as="section" className="mt-8" aria-labelledby="activities-title">
                  <ActivityList
                    activities={filteredActivities}
                    isLoading={isLoading}
                    gridCols={2}  
                    emptyMessage={"Nenhuma atividade encontrada."}
                    onSelectedActivity={setSelectedActivity}
                  />
                </Card>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="primary" onClick={() => setActivityStatus('creating')}>
                Criar nova Atividade
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div>
          <Card as="section" className="mt-8" aria-labelledby="activities-title">
            <div className="flex md:justify-between">
              { !activityId ? (
                <Button size="sm" variant="secondary"
                  onClick={() => {
                    setSelectedActivity(null)
                    setActivityStatus('')
                  }}>
                  Voltar para a lista
                </Button>
              ) : (
                <Button size="sm" variant="secondary"
                  onClick={() => {
                    setSelectedActivity(null)
                    setActivityStatus('')
                    navigate("/tarefas")
                  }}>
                  Voltar para Tarefa
                </Button>
              )}

              {activityStatus === "" && (
                <div className="block md:flex md:gap-2">
                  <Button size="sm" variant="secondary" onClick={() => {setActivityStatus('updating')}}>
                    Editar Atividade
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDeleteActivity(selectedActivity!)}>
                    Excluir Atividade
                  </Button>
                </div>
              )}
              {activityStatus === "updating" && (
                <div className="block md:flex md:gap-2">
                  <Button size="sm" variant="secondary" onClick={() => {setActivityStatus('')}}>
                    Sair da edição de atividade
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <Alert tone="error" className="mt-4">
                {error}
              </Alert>
            )}

            {activityStatus === "" ? (
              <div>
                <Card as="section" className="mt-8" aria-labelledby="activities-title">
                  <ActivityDetail activity={selectedActivity!} isLoading={isLoading} />
                </Card>
              </div>
            ) : (
              <div>
                <Card as="section" className="mt-8" aria-labelledby="activities-title">
                  <CreateActivityForm
                    isCreating={isCreating}
                    onCreateActivity={handleCreateActivity}
                    activity={selectedActivity}
                    isUpdating={isUpdating}
                    onUpdateActivity={handleUpdateActivity}
                  ></CreateActivityForm>
                </Card>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
