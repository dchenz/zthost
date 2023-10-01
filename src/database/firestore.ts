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
} from "firebase/firestore";
import { fstore } from "../firebase";
import type { Database, Document } from "./model";

export class Firestore implements Database {
  async createDocument<T extends Document>(
    collectionName: string,
    data: T
  ): Promise<void> {
    await setDoc(doc(fstore, collectionName, data.id), data);
  }

  async deleteDocument(collectionName: string, id: string): Promise<void> {
    await deleteDoc(doc(fstore, collectionName, id));
  }

  async getDocuments<T extends Document>(
    collectionName: string,
    conditions: Record<string, string | null>
  ): Promise<T[]> {
    const q = query(
      collection(fstore, collectionName),
      ...Object.entries(conditions).map(([attribute, equalsValue]) =>
        where(attribute, "==", equalsValue)
      )
    );
    const results = (await getDocs(q)).docs;
    return results.map((data) => ({ ...data.data(), id: data.id }) as T);
  }

  async getDocument<T extends Document>(
    collectionName: string,
    id: string
  ): Promise<T | null> {
    const result = await getDoc(doc(fstore, collectionName, id));
    return ({ ...result.data(), id } as T) ?? null;
  }

  async updateDocument<T extends Document>(
    collectionName: string,
    id: string,
    updates: Partial<T>
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await updateDoc(doc(fstore, collectionName, id), updates);
  }
}
