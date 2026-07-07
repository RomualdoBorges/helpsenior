import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { Auth, User } from "firebase/auth";

export interface AuthUser {
  id: string;
  email: string | null;
}

export class FirebaseAuthService {
  private readonly auth: Auth;

  constructor(auth: Auth) {
    this.auth = auth;
  }

  async signUp(email: string, password: string): Promise<AuthUser> {
    const credential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password,
    );

    return this.mapUser(credential.user);
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const credential = await signInWithEmailAndPassword(
      this.auth,
      email,
      password,
    );

    return this.mapUser(credential.user);
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    return onAuthStateChanged(this.auth, (user) => {
      callback(user ? this.mapUser(user) : null);
    });
  }

  private mapUser(user: User): AuthUser {
    return {
      id: user.uid,
      email: user.email,
    };
  }
}
