import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";

import type { Activity, ActivityRepository } from "@helpsenior/core";

import { ActivityFirestoreMapper } from "../mappers/ActivityFirestoreMapper";

type FirestoreActivityData = Parameters<
  typeof ActivityFirestoreMapper.fromFirestore
>[1];

export class FirebaseActivityRepository implements ActivityRepository {
  private readonly db: Firestore;
  private readonly collectionName = "activities";

  constructor(db: Firestore) {
    this.db = db;
  }

  async create(activity: Activity): Promise<void> {
    const activityReference = doc(this.db, this.collectionName, activity.id);

    await setDoc(activityReference, ActivityFirestoreMapper.toFirestore(activity));
  }

  async findById(activityId: string): Promise<Activity | null> {
    const activityReference = doc(this.db, this.collectionName, activityId);
    const snapshot = await getDoc(activityReference);

    if (!snapshot.exists()) {
      return null;
    }

    return ActivityFirestoreMapper.fromFirestore(
      activityId,
      snapshot.data() as FirestoreActivityData,
    );
  }

  async listByUserId(userId: string): Promise<Activity[]> {
    const activitiesCollection = collection(this.db, this.collectionName);

    const activitiesQuery = query(activitiesCollection, where("userId", "==", userId));

    const snapshot = await getDocs(activitiesQuery);

    return snapshot.docs.map((activityDocument) =>
      ActivityFirestoreMapper.fromFirestore(
        activityDocument.id,
        activityDocument.data() as FirestoreActivityData,
      ),
    );
  }

  async update(activity: Activity): Promise<void> {
    const activityReference = doc(this.db, this.collectionName, activity.id);

    await updateDoc(activityReference, {
      ...ActivityFirestoreMapper.toFirestore(activity),
    });
  }

  async delete(activityId: string): Promise<void> {
    const activityReference = doc(this.db, this.collectionName, activityId);

    await deleteDoc(activityReference);
  }
}
