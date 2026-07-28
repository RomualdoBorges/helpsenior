import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function createFirebaseApp(config: FirebaseConfig) {
  return initializeApp(config);
}

export function createFirebaseServices(config: FirebaseConfig) {
  const app = createFirebaseApp(config);

  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };
}

export function connectFirebaseEmulators(auth: Auth, db: Firestore) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

export function createFirestoreDatabase(config: FirebaseConfig) {
  const app = createFirebaseApp(config);

  return getFirestore(app);
}

export function createFirebaseAuth(config: FirebaseConfig) {
  const app = createFirebaseApp(config);

  return getAuth(app);
}
