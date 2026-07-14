import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  GetUserProfileUseCase,
  UpdateUserProfileUseCase,
  type UserProfile,
} from "@helpsenior/core";
import { FirebaseUserProfileRepository } from "@helpsenior/firebase/profile";

import { db } from "../../../config/firebase";
import { getFirebaseFirestoreErrorMessage } from "../../../shared/errors/getFirebaseFirestoreErrorMessage";

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
  const loadRequestIdRef = useRef(0);
  const activeUserIdRef = useRef(userId);

  useEffect(() => {
    activeUserIdRef.current = userId;
  }, [userId]);

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
    if (userId !== activeUserIdRef.current) {
      return;
    }

    const requestId = ++loadRequestIdRef.current;

    if (!userId) {
      setProfile(null);
      setIsLoadingProfile(false);
      setProfileError(null);
      return;
    }

    try {
      setIsLoadingProfile(true);
      setProfileError(null);

      const result = await getUserProfileUseCase.execute({
        userId,
        email,
      });

      if (
        requestId === loadRequestIdRef.current &&
        userId === activeUserIdRef.current
      ) {
        setProfile(result.profile);
      }
    } catch (error) {
      if (
        requestId === loadRequestIdRef.current &&
        userId === activeUserIdRef.current
      ) {
        setProfileError(
          getFirebaseFirestoreErrorMessage(
            error,
            "Não foi possível carregar o perfil.",
          ),
        );
      }
    } finally {
      if (
        requestId === loadRequestIdRef.current &&
        userId === activeUserIdRef.current
      ) {
        setIsLoadingProfile(false);
      }
    }
  }, [email, getUserProfileUseCase, userId]);

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

    return () => {
      window.clearTimeout(timeoutId);
      loadRequestIdRef.current += 1;
    };
  }, [loadProfile]);

  return {
    profile,
    isLoadingProfile,
    isUpdatingProfile,
    profileError,
    loadProfile,
    updateProfile,
  };
}
