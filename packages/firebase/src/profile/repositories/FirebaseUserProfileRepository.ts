import type { UserProfile, UserProfileRepository } from "@helpsenior/core";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

import { UserProfileFirestoreMapper } from "../mappers/UserProfileFirestoreMapper";

export class FirebaseUserProfileRepository implements UserProfileRepository {
  private readonly collectionName = "userProfiles";
  private readonly db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const profileRef = doc(this.db, this.collectionName, userId);

    const profileSnapshot = await getDoc(profileRef);

    if (!profileSnapshot.exists()) {
      return null;
    }

    return UserProfileFirestoreMapper.fromFirestore(
      profileSnapshot.data() as never,
    );
  }

  async save(profile: UserProfile): Promise<void> {
    const profileRef = doc(this.db, this.collectionName, profile.userId);

    await setDoc(profileRef, UserProfileFirestoreMapper.toFirestore(profile));
  }
}
