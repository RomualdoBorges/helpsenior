import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";

export interface AuthUser {
  id: string;
  email: string | null;
}

function mapFirebaseUserToAuthUser(user: User): AuthUser {
  return {
    id: user.uid,
    email: user.email,
  };
}

export class FirebaseAuthService {
  private readonly auth: Auth;

  constructor(auth: Auth) {
    this.auth = auth;
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    return onAuthStateChanged(this.auth, (user) => {
      callback(user ? mapFirebaseUserToAuthUser(user) : null);
    });
  }

  async signUp(email: string, password: string): Promise<AuthUser> {
    const credential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password,
    );

    return mapFirebaseUserToAuthUser(credential.user);
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const credential = await signInWithEmailAndPassword(
      this.auth,
      email,
      password,
    );

    return mapFirebaseUserToAuthUser(credential.user);
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }
}
