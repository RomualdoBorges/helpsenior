import { useCallback, useEffect, useMemo, useState } from "react";

import {
  GetUserProfileUseCase,
  UpdateUserProfileUseCase,
} from "@helpsenior/core";
import {
  FirebaseUserProfileRepository,
  type AuthUser,
} from "@helpsenior/firebase";

import { authService, db } from "@/src/config/firebase";

import { getFirebaseAuthErrorMessage } from "./getFirebaseAuthErrorMessage";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const userProfileRepository = useMemo(
    () => new FirebaseUserProfileRepository(db),
    [],
  );
  const getUserProfile = useMemo(
    () => new GetUserProfileUseCase(userProfileRepository),
    [userProfileRepository],
  );
  const updateUserProfile = useMemo(
    () => new UpdateUserProfileUseCase(userProfileRepository),
    [userProfileRepository],
  );

  useEffect(() => {
    return authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      const authenticatedUser = await authService.signIn(email, password);
      setUser(authenticatedUser);
      return true;
    } catch (caughtError) {
      setError(getFirebaseAuthErrorMessage(caughtError));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signUp = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      try {
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        const createdUser = await authService.signUp(
          input.email,
          input.password,
        );

        await getUserProfile.execute({
          userId: createdUser.id,
          email: createdUser.email,
        });
        await updateUserProfile.execute({
          userId: createdUser.id,
          email: createdUser.email,
          name: input.name.trim(),
        });

        setUser(createdUser);
        return true;
      } catch (caughtError) {
        setError(getFirebaseAuthErrorMessage(caughtError));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [getUserProfile, updateUserProfile],
  );

  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      await authService.resetPassword(email);
      setSuccessMessage(
        "Enviamos um e-mail com as instruções para redefinir sua senha.",
      );
    } catch (caughtError) {
      setError(getFirebaseAuthErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      await authService.signOut();
      setUser(null);
      return true;
    } catch (caughtError) {
      setError(getFirebaseAuthErrorMessage(caughtError));
      return false;
    }
  }, []);

  return {
    user,
    isLoading,
    isSubmitting,
    error,
    successMessage,
    signIn,
    signUp,
    resetPassword,
    signOut,
  };
}
