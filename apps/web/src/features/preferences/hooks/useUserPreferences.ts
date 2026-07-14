import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
    "fontSize" | "contrast" | "simpleMode" | "increasedSpacing"
  >
>;

export function useUserPreferences(userId: string | null) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const loadRequestIdRef = useRef(0);
  const activeUserIdRef = useRef(userId);

  useEffect(() => {
    activeUserIdRef.current = userId;
  }, [userId]);

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
    if (userId !== activeUserIdRef.current) {
      return;
    }

    const requestId = ++loadRequestIdRef.current;

    if (!userId) {
      setPreferences(null);
      setIsLoadingPreferences(false);
      setPreferencesError(null);
      return;
    }

    try {
      setIsLoadingPreferences(true);
      setPreferencesError(null);

      const result = await getUserPreferencesUseCase.execute({
        userId,
      });

      if (
        requestId === loadRequestIdRef.current &&
        userId === activeUserIdRef.current
      ) {
        setPreferences(result.preferences);
      }
    } catch (error) {
      if (
        requestId === loadRequestIdRef.current &&
        userId === activeUserIdRef.current
      ) {
        setPreferencesError(
          getFirebaseFirestoreErrorMessage(
            error,
            "Não foi possível carregar as preferências.",
          ),
        );
      }
    } finally {
      if (
        requestId === loadRequestIdRef.current &&
        userId === activeUserIdRef.current
      ) {
        setIsLoadingPreferences(false);
      }
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
    const timeoutId = window.setTimeout(() => {
      void loadPreferences();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      loadRequestIdRef.current += 1;
    };
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
