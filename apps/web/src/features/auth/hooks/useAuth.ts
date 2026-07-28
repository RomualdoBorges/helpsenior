import { useCallback, useEffect, useMemo, useState } from "react";

import {
  GetUserProfileUseCase,
  UpdateUserProfileUseCase,
} from "@helpsenior/core";
import {
  FirebaseUserProfileRepository,
  type AuthUser,
} from "@helpsenior/firebase";

import { authService, db } from "../../../config/firebase";
import { getFirebaseAuthErrorMessage } from "../utils/getFirebaseAuthErrorMessage";

export const USER_PROFILE_UPDATED_EVENT = "helpsenior:user-profile-updated";

export interface UserProfileUpdatedEventDetail {
  userId: string;
  email: string | null;
  name: string;
}

export function getPendingUserProfileNameStorageKey(userId: string) {
  return `helpsenior:pending-user-profile-name:${userId}`;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(
    null,
  );

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

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
    });

    return unsubscribe;
  }, []);

  const signUp = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      try {
        setIsSubmittingAuth(true);
        setAuthError(null);
        setAuthSuccessMessage(null);

        const normalizedName = input.name.trim();

        const createdUser = await authService.signUp(
          input.email,
          input.password,
        );

        await getUserProfileUseCase.execute({
          userId: createdUser.id,
          email: createdUser.email,
        });

        await updateUserProfileUseCase.execute({
          userId: createdUser.id,
          email: createdUser.email,
          name: normalizedName,
        });

        sessionStorage.setItem(
          getPendingUserProfileNameStorageKey(createdUser.id),
          normalizedName,
        );

        setUser(createdUser);

        window.dispatchEvent(
          new CustomEvent<UserProfileUpdatedEventDetail>(
            USER_PROFILE_UPDATED_EVENT,
            {
              detail: {
                userId: createdUser.id,
                email: createdUser.email,
                name: normalizedName,
              },
            },
          ),
        );
      } catch (error) {
        setAuthError(getFirebaseAuthErrorMessage(error));
      } finally {
        setIsSubmittingAuth(false);
      }
    },
    [getUserProfileUseCase, updateUserProfileUseCase],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsSubmittingAuth(true);
      setAuthError(null);
      setAuthSuccessMessage(null);

      const authenticatedUser = await authService.signIn(email, password);

      setUser(authenticatedUser);
      return true;
    } catch (error) {
      setAuthError(getFirebaseAuthErrorMessage(error));
      return false;
    } finally {
      setIsSubmittingAuth(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsSubmittingAuth(true);
      setAuthError(null);
      setAuthSuccessMessage(null);

      await authService.resetPassword(email);

      setAuthSuccessMessage(
        "Enviamos um e-mail com as instruções para redefinir sua senha.",
      );
    } catch (error) {
      setAuthError(getFirebaseAuthErrorMessage(error));
    } finally {
      setIsSubmittingAuth(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setAuthError(null);
      setAuthSuccessMessage(null);

      await authService.signOut();

      setUser(null);
    } catch (error) {
      setAuthError(getFirebaseAuthErrorMessage(error));
    }
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoadingAuth,
    isSubmittingAuth,
    authError,
    authSuccessMessage,
    signUp,
    signIn,
    resetPassword,
    signOut,
  };
}
