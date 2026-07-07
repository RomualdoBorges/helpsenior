import type { Task, TaskRepository } from "@helpsenior/core";
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

import { TaskFirestoreMapper } from "../mappers/TaskFirestoreMapper";

export class FirebaseTaskRepository implements TaskRepository {
  private readonly collectionName = "tasks";
  private readonly db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  async create(task: Task): Promise<void> {
    const taskRef = doc(this.tasksCollection(), task.id);

    await setDoc(taskRef, TaskFirestoreMapper.toFirestore(task));
  }

  async findById(taskId: string): Promise<Task | null> {
    const taskRef = doc(this.tasksCollection(), taskId);
    const taskSnapshot = await getDoc(taskRef);

    if (!taskSnapshot.exists()) {
      return null;
    }

    return TaskFirestoreMapper.fromFirestore(
      taskSnapshot.id,
      taskSnapshot.data() as never,
    );
  }

  async listByUserId(userId: string): Promise<Task[]> {
    const tasksQuery = query(
      this.tasksCollection(),
      where("userId", "==", userId),
    );

    const taskSnapshots = await getDocs(tasksQuery);

    return taskSnapshots.docs.map((taskSnapshot) =>
      TaskFirestoreMapper.fromFirestore(
        taskSnapshot.id,
        taskSnapshot.data() as never,
      ),
    );
  }

  async update(task: Task): Promise<void> {
    const taskRef = doc(this.tasksCollection(), task.id);

    await updateDoc(taskRef, {
      ...TaskFirestoreMapper.toFirestore(task),
    });
  }

  private tasksCollection() {
    return collection(this.db, this.collectionName);
  }
}
