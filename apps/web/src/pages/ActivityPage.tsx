import { useEffect, useMemo, useState } from "react";
import type { Activity } from "@helpsenior/core";

import { CreateActivityForm } from "../features/activities/components/CreateActivityForm";
import { ActivityList } from "../features/activities/components/ActivityList";
import { ActivityDetail } from "../features/activities/components/ActivityDetail";
import {
  useActivities,
  type CreateActivityInput,
  type UpdateActivityInput,
} from "../features/activities/hooks/useActivities";
import { filterActivities } from "../features/activities/utils/filterActivities";
import { Alert, BigNumberCard, Button, Card, Input } from "../shared/ui";
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
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [activityStatus, setActivityStatus] = useState<
    "creating" | "updating" | ""
  >("");

  const filteredActivities = useMemo(
    () => filterActivities(activities, filter),
    [filter, activities],
  );

  async function handleCreateActivity(activity: CreateActivityInput) {
    await createActivity(activity);
    setSelectedActivity(null);
    setActivityStatus("");
  }

  async function handleUpdateActivity(activity: UpdateActivityInput) {
    const shouldUpdate = window.confirm(
      `Deseja atualizar a atividade "${activity.title}"?`,
    );

    if (!shouldUpdate) {
      return;
    }

    await updateActivity(activity);
    setSelectedActivity(null);
    setActivityStatus("");
  }

  async function handleDeleteActivity(activity: Activity) {
    const shouldDelete = window.confirm(
      `Deseja excluir a atividade "${activity.title}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    await deleteActivity(activity.id);
    setSelectedActivity(null);
  }

  useEffect(() => {
    if (activityId) {
      const activity = activities.find(
        (activity) => activity.id === activityId,
      );
      setSelectedActivity(activity!);
    }
  }, [activityId, activities]);

  return (
    <>
      {!selectedActivity && activityStatus === "" ? (
        <div>
          <Card
            as="section"
            className="mt-8"
            aria-labelledby="activities-title">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="activities-title" className="m-0 text-[28px] font-bold">
                  Minhas atividades
                </h2>

                <p className="simple-mode-secondary mt-0 text-base leading-6 text-slate-500">
                  Crie guias simples para acompanhar atividades importantes do
                  dia a dia.
                </p>
              </div>

              <Button
                size="sm"
                variant="primary"
                className="flex shrink-0 items-center justify-center gap-2"
                onClick={() => setActivityStatus("creating")}>
                <span aria-hidden="true" className="text-xl leading-none">
                  +
                </span>
                Nova atividade
              </Button>
            </div>

            <div className="accessibility-summary mt-6 w-full">
              <BigNumberCard
                label="Atividades cadastradas"
                value={activities.length}
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
                    <circle
                      cx="5"
                      cy="6.5"
                      r="1"
                      fill="currentColor"
                      stroke="none"
                    />
                    <circle
                      cx="5"
                      cy="12"
                      r="1"
                      fill="currentColor"
                      stroke="none"
                    />
                    <circle
                      cx="5"
                      cy="17.5"
                      r="1"
                      fill="currentColor"
                      stroke="none"
                    />
                    <path d="M9 6.5h11M9 12h11M9 17.5h11" />
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
                    Lista de atividades
                  </h3>

                  <p className="mt-1 text-sm font-bold text-slate-500">
                    {filteredActivities.length} de {activities.length}{" "}
                    atividades
                    {activities.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="text"
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    placeholder="Procure por suas atividades"
                    className="min-h-10 w-64 text-sm"
                    aria-label="Buscar atividades"
                  />
                </div>
              </div>

              <div className="mt-5">
                <ActivityList
                  activities={filteredActivities}
                  isLoading={isLoading}
                  emptyMessage="Nenhuma atividade encontrada."
                  onSelectedActivity={setSelectedActivity}
                />
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div>
          <Card
            as="section"
            className="mt-8"
            aria-labelledby="activities-title">
            <div className="flex md:justify-between">
              {!activityId ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSelectedActivity(null);
                    setActivityStatus("");
                  }}>
                  Voltar para a lista
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSelectedActivity(null);
                    setActivityStatus("");
                    navigate("/tarefas");
                  }}>
                  Voltar para Tarefa
                </Button>
              )}

              {activityStatus === "" && (
                <div className="block md:flex md:gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setActivityStatus("updating");
                    }}>
                    Editar Atividade
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteActivity(selectedActivity!)}>
                    Excluir Atividade
                  </Button>
                </div>
              )}
              {activityStatus === "updating" && (
                <div className="block md:flex md:gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setActivityStatus("");
                    }}>
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
                <Card
                  as="section"
                  className="mt-8"
                  aria-labelledby="activities-title">
                  <ActivityDetail
                    activity={selectedActivity!}
                    isLoading={isLoading}
                  />
                </Card>
              </div>
            ) : (
              <div>
                <Card
                  as="section"
                  className="mt-8"
                  aria-labelledby="activities-title">
                  <CreateActivityForm
                    isCreating={isCreating}
                    onCreateActivity={handleCreateActivity}
                    activity={selectedActivity}
                    isUpdating={isUpdating}
                    onUpdateActivity={
                      handleUpdateActivity
                    }></CreateActivityForm>
                </Card>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
