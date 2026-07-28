import { useCallback, useEffect, useMemo, useState } from "react";

import {
  GetUserProfileUseCase,
  UpdateUserProfileUseCase,
  type UserProfile,
} from "@helpsenior/core";
import { FirebaseUserProfileRepository } from "@helpsenior/firebase";

import { db } from "@/src/config/firebase";
import { getFirebaseFirestoreErrorMessage } from "@/src/shared/errors/getFirebaseFirestoreErrorMessage";

interface UpdateProfileInput {
  name?: string;
  phone?: string;
  birthDate?: string;
}

export function useUserProfile(userId: string | null, email: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new FirebaseUserProfileRepository(db), []);
  const getProfile = useMemo(
    () => new GetUserProfileUseCase(repository),
    [repository],
  );
  const updateProfileUseCase = useMemo(
    () => new UpdateUserProfileUseCase(repository),
    [repository],
  );

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await getProfile.execute({ userId, email });
      setProfile(result.profile);
    } catch (caughtError) {
      setError(
        getFirebaseFirestoreErrorMessage(
          caughtError,
          "Não foi possível carregar o perfil.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [email, getProfile, userId]);

  const updateProfile = useCallback(
    async (input: UpdateProfileInput) => {
      if (!userId) {
        return false;
      }

      try {
        setIsUpdating(true);
        setError(null);
        const result = await updateProfileUseCase.execute({
          userId,
          email,
          ...input,
        });
        setProfile(result.profile);
        return true;
      } catch (caughtError) {
        setError(
          getFirebaseFirestoreErrorMessage(
            caughtError,
            "Não foi possível salvar o perfil.",
          ),
        );
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [email, updateProfileUseCase, userId],
  );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return {
    profile,
    isLoading,
    isUpdating,
    error,
    updateProfile,
  };
}
