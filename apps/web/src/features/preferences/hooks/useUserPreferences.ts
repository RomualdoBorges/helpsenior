import { useCallback, useEffect, useMemo, useState } from "react";

import {
  GetUserPreferencesUseCase,
  UpdateUserPreferencesUseCase,
  type UserPreferences,
} from "@helpsenior/core";
import { FirebaseUserPreferencesRepository } from "@helpsenior/firebase";

import { db } from "../../../config/firebase";
import { getFirebaseFirestoreErrorMessage } from "../../../shared/errors/getFirebaseFirestoreErrorMessage";

type UpdateUserPreferencesInput = Partial<
  Pick<
    UserPreferences,
    "fontSize" | "contrast" | "simpleMode" | "reduceMotion" | "increasedSpacing"
  >
>;

export function useUserPreferences(userId: string | null) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);

  const userPreferencesRepository = useMemo(
    () => new FirebaseUserPreferencesRepository(db),
    [],
  );

  const getUserPreferencesUseCase = useMemo(
    () => new GetUserPreferencesUseCase(userPreferencesRepository),
    [userPreferencesRepository],
  );

  const updateUserPreferencesUseCase = useMemo(
    () => new UpdateUserPreferencesUseCase(userPreferencesRepository),
    [userPreferencesRepository],
  );

  const loadPreferences = useCallback(async () => {
    if (!userId) {
      setPreferences(null);
      return;
    }

    try {
      setIsLoadingPreferences(true);
      setPreferencesError(null);

      const result = await getUserPreferencesUseCase.execute({
        userId,
      });

      setPreferences(result.preferences);
    } catch (error) {
      setPreferencesError(
        getFirebaseFirestoreErrorMessage(
          error,
          "Não foi possível carregar as preferências.",
        ),
      );
    } finally {
      setIsLoadingPreferences(false);
    }
  }, [getUserPreferencesUseCase, userId]);

  const updatePreferences = useCallback(
    async (input: UpdateUserPreferencesInput) => {
      if (!userId) {
        return;
      }

      try {
        setIsUpdatingPreferences(true);
        setPreferencesError(null);

        const result = await updateUserPreferencesUseCase.execute({
          userId,
          ...input,
        });

        setPreferences(result.preferences);
      } catch (error) {
        setPreferencesError(
          getFirebaseFirestoreErrorMessage(
            error,
            "Não foi possível salvar as preferências.",
          ),
        );
      } finally {
        setIsUpdatingPreferences(false);
      }
    },
    [updateUserPreferencesUseCase, userId],
  );

  useEffect(() => {
    void loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    isLoadingPreferences,
    isUpdatingPreferences,
    preferencesError,
    loadPreferences,
    updatePreferences,
  };
}
