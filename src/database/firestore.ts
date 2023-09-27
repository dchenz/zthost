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
import { fstore } from "../config";
import type { Database } from "./model";

export class Firestore implements Database {
  async createDocument<T extends object>(
    collectionName: string,
    id: string,
    data: T
  ): Promise<void> {
    await setDoc(doc(fstore, collectionName, id), data);
  }

  async deleteDocument(collectionName: string, id: string): Promise<void> {
    await deleteDoc(doc(fstore, collectionName, id));
  }

  async getDocuments<T extends object>(
    collectionName: string,
    conditions: { attribute: string; equalsValue: string }[]
  ): Promise<T[]> {
    const q = query(
      collection(fstore, collectionName),
      ...conditions.map(({ attribute, equalsValue }) =>
        where(attribute, "==", equalsValue)
      )
    );
    const results = (await getDocs(q)).docs;
    return results.map((data) => data.data() as T);
  }

  async getDocument<T extends object>(
    collectionName: string,
    id: string
  ): Promise<T | null> {
    const result = await getDoc(doc(fstore, collectionName, id));
    return (result.data() as T) ?? null;
  }

  async updateDocument<T extends object>(
    collectionName: string,
    id: string,
    updates: Partial<T>
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await updateDoc(doc(fstore, collectionName, id), updates);
  }
}
