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
    collection: T,
    doc: AppCollections[T]
  ): Promise<void> => {
    this.collections[collection] ??= [];
    this.collections[collection].push(doc);
  };

  deleteDocument = async <T extends keyof AppCollections>(
    collection: T,
    id: string
  ): Promise<void> => {
    this.collections[collection] = this.collections[collection].filter(
      (doc) => doc.id !== id
    );
    if (!this.collections[collection].length) {
      delete this.collections[collection];
    }
  };

  getDocument = async <T extends keyof AppCollections>(
    collection: T,
    id: string
  ): Promise<AppCollections[T] | null> => {
    const foundDoc = this.collections[collection].find(
      (doc) => doc.id === id
    ) as AppCollections[T];
    return foundDoc ?? null;
  };

  getDocuments = async <T extends keyof AppCollections>(
    collection: T,
    conditions: Partial<AppCollections[T]>
  ): Promise<AppCollections[T][]> => {
    const results: AppCollections[T][] = [];
    for (const doc of (this.collections[collection] as AppCollections[T][]) ??
      []) {
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
    collection: T,
    id: string,
    updates: Partial<AppCollections[T]>
  ): Promise<void> => {
    this.collections[collection] = this.collections[collection].map((doc) =>
      doc.id === id ? { ...doc, ...updates } : doc
    );
  };
}
