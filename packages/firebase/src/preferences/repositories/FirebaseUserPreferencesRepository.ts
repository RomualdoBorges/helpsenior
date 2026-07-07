import type {
  UserPreferences,
  UserPreferencesRepository,
} from "@helpsenior/core";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

import { UserPreferencesFirestoreMapper } from "../mappers/UserPreferencesFirestoreMapper";

export class FirebaseUserPreferencesRepository implements UserPreferencesRepository {
  private readonly collectionName = "userPreferences";
  private readonly db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    const preferencesRef = doc(this.db, this.collectionName, userId);

    const preferencesSnapshot = await getDoc(preferencesRef);

    if (!preferencesSnapshot.exists()) {
      return null;
    }

    return UserPreferencesFirestoreMapper.fromFirestore(
      preferencesSnapshot.data() as never,
    );
  }

  async save(preferences: UserPreferences): Promise<void> {
    const preferencesRef = doc(
      this.db,
      this.collectionName,
      preferences.userId,
    );

    await setDoc(
      preferencesRef,
      UserPreferencesFirestoreMapper.toFirestore(preferences),
    );
  }
}
