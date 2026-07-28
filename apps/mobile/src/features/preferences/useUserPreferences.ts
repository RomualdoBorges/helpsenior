import { useCallback, useEffect, useMemo, useState } from "react";

import {
  GetUserPreferencesUseCase,
  UpdateUserPreferencesUseCase,
  type UserPreferences,
} from "@helpsenior/core";
import { FirebaseUserPreferencesRepository } from "@helpsenior/firebase";

import { db } from "@/src/config/firebase";
import { getFirebaseFirestoreErrorMessage } from "@/src/shared/errors/getFirebaseFirestoreErrorMessage";

type UpdatePreferencesInput = Partial<
  Pick<
    UserPreferences,
    | "fontSize"
    | "contrast"
    | "simpleMode"
    | "reduceMotion"
    | "increasedSpacing"
  >
>;

export function useUserPreferences(userId: string | null) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(
    () => new FirebaseUserPreferencesRepository(db),
    [],
  );
  const getPreferences = useMemo(
    () => new GetUserPreferencesUseCase(repository),
    [repository],
  );
  const updatePreferencesUseCase = useMemo(
    () => new UpdateUserPreferencesUseCase(repository),
    [repository],
  );

  const loadPreferences = useCallback(async () => {
    if (!userId) {
      setPreferences(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await getPreferences.execute({ userId });
      setPreferences(result.preferences);
    } catch (caughtError) {
      setError(
        getFirebaseFirestoreErrorMessage(
          caughtError,
          "Não foi possível carregar as preferências.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [getPreferences, userId]);

  const updatePreferences = useCallback(
    async (input: UpdatePreferencesInput) => {
      if (!userId || !preferences || isUpdating) return;

      const previousPreferences = preferences;
      const optimisticPreferences: UserPreferences = {
        ...previousPreferences,
        ...input,
        updatedAt: new Date(),
      };

      setPreferences(optimisticPreferences);
      setIsUpdating(true);
      setError(null);

      try {
        const result = await updatePreferencesUseCase.execute({
          userId,
          ...input,
        });
        setPreferences(result.preferences);
      } catch (caughtError) {
        setPreferences(previousPreferences);
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível salvar as preferências.",
          ),
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [isUpdating, preferences, updatePreferencesUseCase, userId],
  );

  useEffect(() => {
    void loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    isLoading,
    isUpdating,
    error,
    updatePreferences,
  };
}
