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
import type { AppCollections, Database } from "./model";

export class Firestore implements Database<AppCollections> {
  async createDocument<T extends keyof AppCollections>(
    collectionName: T,
    data: AppCollections[T]
  ): Promise<void> {
    await setDoc(doc(fstore, collectionName, data.id), data);
  }

  async deleteDocument<T extends keyof AppCollections>(
    collectionName: T,
    id: string
  ): Promise<void> {
    await deleteDoc(doc(fstore, collectionName, id));
  }

  async getDocuments<T extends keyof AppCollections>(
    collectionName: T,
    conditions: Partial<AppCollections[T]>
  ): Promise<AppCollections[T][]> {
    const q = query(
      collection(fstore, collectionName),
      ...Object.entries(conditions).map(([attribute, equalsValue]) =>
        where(attribute, "==", equalsValue)
      )
    );
    const results = (await getDocs(q)).docs;
    return results.map(
      (data) => ({ ...data.data(), id: data.id }) as AppCollections[T]
    );
  }

  async getDocument<T extends keyof AppCollections>(
    collectionName: T,
    id: string
  ): Promise<AppCollections[T] | null> {
    const result = await getDoc(doc(fstore, collectionName, id));
    return ({ ...result.data(), id } as AppCollections[T]) ?? null;
  }

  async updateDocument<T extends keyof AppCollections>(
    collectionName: T,
    id: string,
    updates: Partial<AppCollections[T]>
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await updateDoc(doc(fstore, collectionName, id), updates);
  }
}
