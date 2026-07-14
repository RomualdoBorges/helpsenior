import type { FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export function createFirestoreDatabaseFromApp(app: FirebaseApp) {
  return getFirestore(app);
}
