import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import type { FirebaseConfig } from "./firebase";

export function createFirebaseAuth(config: FirebaseConfig) {
  const app = initializeApp(config);

  return getAuth(app);
}
