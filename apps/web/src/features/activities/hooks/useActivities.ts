import { useCallback, useEffect, useMemo, useState } from "react";

import {
  GetActivityUseCase,
  CreateActivityUseCase,
  DeleteActivityUseCase,
  ListActivitiesUseCase,
  UpdateActivityUseCase,
  type Step,
  type NecessaryResources,
  type Activity,
} from "@helpsenior/core";
import { FirebaseActivityRepository } from "@helpsenior/firebase";

import { db } from "../../../config/firebase";
import { getFirebaseFirestoreErrorMessage } from "../../../shared/errors/getFirebaseFirestoreErrorMessage";
import { sortActivitiesRecent } from "../utils/sortActivities";

export interface CreateActivityInput {
  title: string;
  steps: Step[];
  description?: string;
  resources?: NecessaryResources[];
}

export interface UpdateActivityInput {
  activityId: string;
  title: string;
  steps: Step[];
  description?: string;
  resources?: NecessaryResources[];
}


export function useActivities(userId: string | null) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activityRepository = useMemo(() => new FirebaseActivityRepository(db), []);

  const createActivityUseCase = useMemo(
    () => new CreateActivityUseCase(activityRepository),
    [activityRepository],
  );

  const listActivitiesUseCase = useMemo(
    () => new ListActivitiesUseCase(activityRepository),
    [activityRepository],
  );

  const getActivityUseCase = useMemo(
    () => new GetActivityUseCase(activityRepository),
    [activityRepository],
  );

  const deleteActivityUseCase = useMemo(
    () => new DeleteActivityUseCase(activityRepository),
    [activityRepository],
  );

  const updateActivityUseCase = useMemo(
    () => new UpdateActivityUseCase(activityRepository),
    [activityRepository],
  );

  const loadActivities = useCallback(async () => {
    if (!userId) {
      setActivities([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await listActivitiesUseCase.execute({
        userId,
      });

      setActivities(sortActivitiesRecent(result.activities));
    } catch (caughtError) {
      setError(
        getFirebaseFirestoreErrorMessage(
          caughtError,
          "Não foi possível carregar as atividades.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [listActivitiesUseCase, userId]);

  const getActivity = useCallback(
    async (activityId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await getActivityUseCase.execute({
          activityId,
        });

        return result.activity;
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível carregar a atividade.",
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [getActivityUseCase],
  );

  const createActivity = useCallback(
    async (input: CreateActivityInput) => {
      if (!userId) {
        return;
      }

      try {
        setIsCreating(true);
        setError(null);

        await createActivityUseCase.execute({
          userId,
          title: input.title,
          description: input.description,
          steps: input.steps,
          resources: input.resources,
        });

        await loadActivities();
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível criar a atividade.",
          ),
        );
      } finally {
        setIsCreating(false);
      }
    },
    [createActivityUseCase, loadActivities, userId],
  );

  const updateActivity = useCallback(
    async (input: UpdateActivityInput) => {
      try {
        setIsUpdating(true);
        setError(null);

        await updateActivityUseCase.execute({
          activityId: input.activityId,
          title: input.title,
          description: input.description,
          steps: input.steps,
          resources: input.resources,
        });

        await loadActivities();
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível atualizar a atividade.",
          ),
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [loadActivities, updateActivityUseCase],
  );

  const deleteActivity = useCallback(
    async (activityId: string) => {
      try {
        setIsDeleting(true);
        setError(null);

        await deleteActivityUseCase.execute({
          activityId,
        });

        await loadActivities();
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível excluir a atividade.",
          ),
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteActivityUseCase, loadActivities],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadActivities();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadActivities]);

  return {
    activities,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    loadActivities,
    createActivity,
    updateActivity,
    getActivity,
    deleteActivity,
  };
}
