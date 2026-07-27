import { useMemo, useState } from "react";

import { CreateActivityForm } from "../features/activities/components/CreateActivityForm";
import { ActivityList } from "../features/activities/components/ActivityList";
import { useActivities } from "../features/activities/hooks/useActivities";
import {
  filterActivities,
} from "../features/activities/utils/filterActivities";
import { Alert, Button, Card, Input } from "../shared/ui";
import { useNavigate } from "react-router-dom";

interface Activity {
  id: string;
}

interface HomePageUser {
  id: string;
}

interface HomePageProps {
  user: HomePageUser;
}

export function HomePage({ user }: HomePageProps) {
  const navigate = useNavigate();
  const {
    activities,
    isLoading,
    // isCreating,
    // isUpdating,
    // isDeleting,
    error,
    createActivity,
    // updateActivity,
    // getActivity,
    // deleteActivity,
  } = useActivities(user.id);

  const [filter, setFilter] = useState("");

  const filteredActivities = useMemo(
    () => filterActivities(activities, filter),
    [filter, activities],
  );
  
  function handleActivityDetails(activity: Activity) {
    navigate(`/activities/${activity.id}`);
  }

  return (
    <Card as="section" className="mt-8" aria-labelledby="activities-title">
      <div>
        <h2 id="activities-title" className="m-0 text-[28px] font-bold">
          Minhas atividades
        </h2>

        <p className="simple-mode-secondary mt-2 text-base leading-6 text-slate-500">
          Crie guias simples para acompanhar atividades importantes do dia a dia.
        </p>
      </div>

      {/* <CreateActivityForm isCreating={isCreating} onCreateActivity={createActivity} /> */}

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
              gridCols={1}  
              emptyMessage={"Nenhuma atividade encontrada."}
              onActivityDetails={handleActivityDetails}
            />
          </Card>

          <Card as="section" className="mt-8" aria-labelledby="activities-title">
            <CreateActivityForm
                isCreating={isLoading}
                onCreateActivity={createActivity}
            />
          </Card>
        </div>
      </div>
    </Card>
  );
}
