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

import type { Task, TaskRepository } from "@helpsenior/core";

import { TaskFirestoreMapper } from "../mappers/TaskFirestoreMapper";

type FirestoreTaskData = Parameters<
  typeof TaskFirestoreMapper.fromFirestore
>[1];

export class FirebaseTaskRepository implements TaskRepository {
  private readonly db: Firestore;
  private readonly collectionName = "tasks";

  constructor(db: Firestore) {
    this.db = db;
  }

  async create(task: Task): Promise<void> {
    const taskReference = doc(this.db, this.collectionName, task.id);

    await setDoc(taskReference, TaskFirestoreMapper.toFirestore(task));
  }

  async findById(taskId: string): Promise<Task | null> {
    const taskReference = doc(this.db, this.collectionName, taskId);
    const snapshot = await getDoc(taskReference);

    if (!snapshot.exists()) {
      return null;
    }

    return TaskFirestoreMapper.fromFirestore(
      taskId,
      snapshot.data() as FirestoreTaskData,
    );
  }

  async listByUserId(userId: string): Promise<Task[]> {
    const tasksCollection = collection(this.db, this.collectionName);

    const tasksQuery = query(tasksCollection, where("userId", "==", userId));

    const snapshot = await getDocs(tasksQuery);

    return snapshot.docs.map((taskDocument) =>
      TaskFirestoreMapper.fromFirestore(
        taskDocument.id,
        taskDocument.data() as FirestoreTaskData,
      ),
    );
  }

  async update(task: Task): Promise<void> {
    const taskReference = doc(this.db, this.collectionName, task.id);

    await updateDoc(taskReference, {
      ...TaskFirestoreMapper.toFirestore(task),
    });
  }

  async delete(taskId: string): Promise<void> {
    const taskReference = doc(this.db, this.collectionName, taskId);

    await deleteDoc(taskReference);
  }
}
