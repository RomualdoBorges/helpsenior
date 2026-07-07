import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

export function createFirestoreDatabase(config: FirebaseConfig) {
  const app = createFirebaseApp(config);

  return getFirestore(app);
}

export function createFirebaseAuth(config: FirebaseConfig) {
  const app = createFirebaseApp(config);

  return getAuth(app);
}
