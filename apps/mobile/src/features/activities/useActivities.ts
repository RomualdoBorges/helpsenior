import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CreateActivityUseCase,
  DeleteActivityUseCase,
  ListActivitiesUseCase,
  UpdateActivityUseCase,
  type Activity,
  type Step,
} from "@helpsenior/core";
import { FirebaseActivityRepository } from "@helpsenior/firebase";

import { db } from "@/src/config/firebase";
import { getFirebaseFirestoreErrorMessage } from "@/src/shared/errors/getFirebaseFirestoreErrorMessage";

export interface ActivityInput {
  title: string;
  description?: string;
  steps: Step[];
}

export interface UpdateActivityInput extends ActivityInput {
  activityId: string;
}

function sortActivities(activities: Activity[]) {
  return [...activities].sort(
    (firstActivity, secondActivity) =>
      secondActivity.updatedAt.getTime() - firstActivity.updatedAt.getTime(),
  );
}

export function useActivities(userId: string | null) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new FirebaseActivityRepository(db), []);
  const createUseCase = useMemo(
    () => new CreateActivityUseCase(repository),
    [repository],
  );
  const listUseCase = useMemo(
    () => new ListActivitiesUseCase(repository),
    [repository],
  );
  const updateUseCase = useMemo(
    () => new UpdateActivityUseCase(repository),
    [repository],
  );
  const deleteUseCase = useMemo(
    () => new DeleteActivityUseCase(repository),
    [repository],
  );

  const loadActivities = useCallback(async () => {
    if (!userId) {
      setActivities([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await listUseCase.execute({ userId });
      setActivities(sortActivities(result.activities));
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
  }, [listUseCase, userId]);

  const createActivity = useCallback(
    async (input: ActivityInput) => {
      if (!userId) {
        return false;
      }

      try {
        setIsSaving(true);
        setError(null);
        await createUseCase.execute({ userId, ...input });
        await loadActivities();
        return true;
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível criar a atividade.",
          ),
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [createUseCase, loadActivities, userId],
  );

  const updateActivity = useCallback(
    async (input: UpdateActivityInput) => {
      try {
        setIsSaving(true);
        setError(null);
        await updateUseCase.execute(input);
        await loadActivities();
        return true;
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível atualizar a atividade.",
          ),
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadActivities, updateUseCase],
  );

  const deleteActivity = useCallback(
    async (activityId: string) => {
      try {
        setIsDeleting(true);
        setError(null);
        await deleteUseCase.execute({ activityId });
        await loadActivities();
        return true;
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível excluir a atividade.",
          ),
        );
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteUseCase, loadActivities],
  );

  useEffect(() => {
    void loadActivities();
  }, [loadActivities]);

  return {
    activities,
    isLoading,
    isSaving,
    isDeleting,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
  };
}
