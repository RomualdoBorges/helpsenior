import type { Reminder, ReminderRepository } from "@helpsenior/core";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

import { ReminderFirestoreMapper } from "../mappers/ReminderFirestoreMapper";

export class FirebaseReminderRepository implements ReminderRepository {
  private readonly collectionName = "reminders";
  private readonly db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  async create(reminder: Reminder): Promise<void> {
    const reminderRef = doc(this.remindersCollection(), reminder.id);

    await setDoc(reminderRef, ReminderFirestoreMapper.toFirestore(reminder));
  }

  async findById(reminderId: string): Promise<Reminder | null> {
    const reminderRef = doc(this.remindersCollection(), reminderId);

    const reminderSnapshot = await getDoc(reminderRef);

    if (!reminderSnapshot.exists()) {
      return null;
    }

    return ReminderFirestoreMapper.fromFirestore(
      reminderSnapshot.id,
      reminderSnapshot.data() as never,
    );
  }

  async listByUserId(userId: string): Promise<Reminder[]> {
    const remindersQuery = query(
      this.remindersCollection(),
      where("userId", "==", userId),
    );

    const reminderSnapshots = await getDocs(remindersQuery);

    return reminderSnapshots.docs.map((reminderSnapshot) =>
      ReminderFirestoreMapper.fromFirestore(
        reminderSnapshot.id,
        reminderSnapshot.data() as never,
      ),
    );
  }

  async update(reminder: Reminder): Promise<void> {
    const reminderRef = doc(this.remindersCollection(), reminder.id);

    await updateDoc(reminderRef, {
      ...ReminderFirestoreMapper.toFirestore(reminder),
    });
  }

  private remindersCollection() {
    return collection(this.db, this.collectionName);
  }
}
