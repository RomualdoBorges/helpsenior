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

import type { Reminder, ReminderRepository } from "@helpsenior/core";

import { ReminderFirestoreMapper } from "../mappers/ReminderFirestoreMapper";

type FirestoreReminderData = Parameters<
  typeof ReminderFirestoreMapper.fromFirestore
>[1];

export class FirebaseReminderRepository implements ReminderRepository {
  private readonly db: Firestore;
  private readonly collectionName = "reminders";

  constructor(db: Firestore) {
    this.db = db;
  }

  async create(reminder: Reminder): Promise<void> {
    const reminderReference = doc(this.db, this.collectionName, reminder.id);

    await setDoc(
      reminderReference,
      ReminderFirestoreMapper.toFirestore(reminder),
    );
  }

  async findById(reminderId: string): Promise<Reminder | null> {
    const reminderReference = doc(this.db, this.collectionName, reminderId);
    const snapshot = await getDoc(reminderReference);

    if (!snapshot.exists()) {
      return null;
    }

    return ReminderFirestoreMapper.fromFirestore(
      reminderId,
      snapshot.data() as FirestoreReminderData,
    );
  }

  async listByUserId(userId: string): Promise<Reminder[]> {
    const remindersCollection = collection(this.db, this.collectionName);

    const remindersQuery = query(
      remindersCollection,
      where("userId", "==", userId),
    );

    const snapshot = await getDocs(remindersQuery);

    return snapshot.docs.map((reminderDocument) =>
      ReminderFirestoreMapper.fromFirestore(
        reminderDocument.id,
        reminderDocument.data() as FirestoreReminderData,
      ),
    );
  }

  async update(reminder: Reminder): Promise<void> {
    const reminderReference = doc(this.db, this.collectionName, reminder.id);

    await updateDoc(reminderReference, {
      ...ReminderFirestoreMapper.toFirestore(reminder),
    });
  }

  async delete(reminderId: string): Promise<void> {
    const reminderReference = doc(this.db, this.collectionName, reminderId);

    await deleteDoc(reminderReference);
  }
}