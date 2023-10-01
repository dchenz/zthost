import type { AppCollections, Database } from "../../src/database/model";

type DataStore = Record<
  keyof AppCollections,
  AppCollections[keyof AppCollections][]
>;

export class MockDatabase implements Database<AppCollections> {
  collections: DataStore;

  constructor(initialData?: Partial<DataStore>) {
    this.collections = (initialData ?? {}) as DataStore;
  }

  createDocument = async <T extends keyof AppCollections>(
    collectionName: T,
    document: AppCollections[T]
  ): Promise<void> => {
    this.collections[collectionName] ??= [];
    this.collections[collectionName].push(document);
  };

  deleteDocument = async <T extends keyof AppCollections>(
    collectionName: T,
    documentId: string
  ): Promise<void> => {
    this.collections[collectionName] = this.collections[collectionName].filter(
      (doc) => doc.id !== documentId
    );
    if (!this.collections[collectionName].length) {
      delete this.collections[collectionName];
    }
  };

  getDocument = async <T extends keyof AppCollections>(
    collectionName: T,
    documentId: string
  ): Promise<AppCollections[T] | null> => {
    const foundDoc = this.collections[collectionName].find(
      (doc) => doc.id === documentId
    ) as AppCollections[T];
    return foundDoc ?? null;
  };

  getDocuments = async <T extends keyof AppCollections>(
    collectionName: T,
    conditions: Partial<AppCollections[T]>
  ): Promise<AppCollections[T][]> => {
    const results: AppCollections[T][] = [];
    for (const doc of (this.collections[
      collectionName
    ] as AppCollections[T][]) ?? []) {
      let matched = true;
      for (const attribute of Object.keys(conditions)) {
        if (
          doc[attribute as keyof AppCollections[T]] !==
          conditions[attribute as keyof AppCollections[T]]
        ) {
          matched = false;
          break;
        }
      }
      if (matched) {
        results.push(doc as AppCollections[T]);
      }
    }
    return results;
  };

  updateDocument = async <T extends keyof AppCollections>(
    collectionName: T,
    documentId: string,
    updates: Partial<AppCollections[T]>
  ): Promise<void> => {
    this.collections[collectionName] = this.collections[collectionName].map(
      (doc) => (doc.id === documentId ? { ...doc, ...updates } : doc)
    );
  };
}
