import { createFirestoreDatabaseFromApp } from "@helpsenior/firebase/config/firestore";

import { auth } from "./firebaseAuth";

export const db = createFirestoreDatabaseFromApp(auth.app);
