import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { UpdateUserProfileUseCase } from "@helpsenior/core";
import {
  FirebaseUserProfileRepository,
  type AuthUser,
} from "@helpsenior/firebase";

import { authService, db } from "../../../config/firebase";
import { getFirebaseAuthErrorMessage } from "../utils/getFirebaseAuthErrorMessage";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(
    null,
  );
  const isSigningUpRef = useRef(false);

  const userProfileRepository = useMemo(
    () => new FirebaseUserProfileRepository(db),
    [],
  );

  const updateUserProfileUseCase = useMemo(
    () => new UpdateUserProfileUseCase(userProfileRepository),
    [userProfileRepository],
  );

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      if (isSigningUpRef.current) {
        return;
      }

      setUser(currentUser);
      setIsLoadingAuth(false);
    });

    return unsubscribe;
  }, []);

  const signUp = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      let createdUser: AuthUser | null = null;

      try {
        isSigningUpRef.current = true;
        setIsSubmittingAuth(true);
        setAuthError(null);
        setAuthSuccessMessage(null);

        const normalizedName = input.name.trim();

        createdUser = await authService.signUp(
          input.email,
          input.password,
        );

        await updateUserProfileUseCase.execute({
          userId: createdUser.id,
          email: createdUser.email,
          name: normalizedName,
        });

        isSigningUpRef.current = false;
        setUser(createdUser);
      } catch (error) {
        isSigningUpRef.current = false;

        if (createdUser) {
          setUser(createdUser);
        }

        setAuthError(getFirebaseAuthErrorMessage(error));
      } finally {
        isSigningUpRef.current = false;
        setIsSubmittingAuth(false);
      }
    },
    [updateUserProfileUseCase],
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
