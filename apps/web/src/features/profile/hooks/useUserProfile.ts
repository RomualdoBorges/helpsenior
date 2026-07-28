import { useCallback, useEffect, useMemo, useState } from "react";

import {
  GetUserProfileUseCase,
  UpdateUserProfileUseCase,
  type UserProfile,
} from "@helpsenior/core";
import { FirebaseUserProfileRepository } from "@helpsenior/firebase";

import { db } from "../../../config/firebase";
import { getFirebaseFirestoreErrorMessage } from "../../../shared/errors/getFirebaseFirestoreErrorMessage";
import {
  USER_PROFILE_UPDATED_EVENT,
  getPendingUserProfileNameStorageKey,
  type UserProfileUpdatedEventDetail,
} from "../../auth/hooks/useAuth";

interface UseUserProfileInput {
  userId: string | null;
  email: string | null;
}

interface UpdateUserProfileInput {
  name?: string;
  phone?: string;
  birthDate?: string;
}

export function useUserProfile({ userId, email }: UseUserProfileInput) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const userProfileRepository = useMemo(
    () => new FirebaseUserProfileRepository(db),
    [],
  );

  const getUserProfileUseCase = useMemo(
    () => new GetUserProfileUseCase(userProfileRepository),
    [userProfileRepository],
  );

  const updateUserProfileUseCase = useMemo(
    () => new UpdateUserProfileUseCase(userProfileRepository),
    [userProfileRepository],
  );

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }

    try {
      setIsLoadingProfile(true);
      setProfileError(null);

      const result = await getUserProfileUseCase.execute({
        userId,
        email,
      });

      const pendingName = sessionStorage.getItem(
        getPendingUserProfileNameStorageKey(userId),
      );

      if (pendingName && result.profile.name !== pendingName) {
        const updatedResult = await updateUserProfileUseCase.execute({
          userId,
          email,
          name: pendingName,
        });

        setProfile(updatedResult.profile);

        sessionStorage.removeItem(getPendingUserProfileNameStorageKey(userId));

        return;
      }

      if (pendingName && result.profile.name === pendingName) {
        sessionStorage.removeItem(getPendingUserProfileNameStorageKey(userId));
      }

      setProfile(result.profile);
    } catch (error) {
      setProfileError(
        getFirebaseFirestoreErrorMessage(
          error,
          "Não foi possível carregar o perfil.",
        ),
      );
    } finally {
      setIsLoadingProfile(false);
    }
  }, [email, getUserProfileUseCase, updateUserProfileUseCase, userId]);

  const updateProfile = useCallback(
    async (input: UpdateUserProfileInput) => {
      if (!userId) {
        return;
      }

      try {
        setIsUpdatingProfile(true);
        setProfileError(null);

        const result = await updateUserProfileUseCase.execute({
          userId,
          email,
          name: input.name,
          phone: input.phone,
          birthDate: input.birthDate,
        });

        setProfile(result.profile);
      } catch (error) {
        setProfileError(
          getFirebaseFirestoreErrorMessage(
            error,
            "Não foi possível salvar o perfil.",
          ),
        );
      } finally {
        setIsUpdatingProfile(false);
      }
    },
    [email, updateUserProfileUseCase, userId],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProfile]);

  useEffect(() => {
    function handleUserProfileUpdated(event: Event) {
      const customEvent = event as CustomEvent<UserProfileUpdatedEventDetail>;

      const detail = customEvent.detail;

      if (!detail?.userId) {
        return;
      }

      const now = new Date();

      setProfile({
        userId: detail.userId,
        email: detail.email,
        name: detail.name,
        createdAt: now,
        updatedAt: now,
      });

      if (userId === detail.userId) {
        void loadProfile();
      }
    }

    window.addEventListener(
      USER_PROFILE_UPDATED_EVENT,
      handleUserProfileUpdated,
    );

    return () => {
      window.removeEventListener(
        USER_PROFILE_UPDATED_EVENT,
        handleUserProfileUpdated,
      );
    };
  }, [loadProfile, userId]);

  return {
    profile,
    isLoadingProfile,
    isUpdatingProfile,
    profileError,
    loadProfile,
    updateProfile,
  };
}
