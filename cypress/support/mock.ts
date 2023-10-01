import type { Database, Document } from "../../src/database/model";

export class MockDatabase implements Database {
  collections: Record<string, Record<string, Record<string, unknown>>>;

  constructor(
    initialData?: Record<string, Record<string, Record<string, unknown>>>
  ) {
    this.collections = initialData ?? {};
  }

  createDocument = async <T extends Document>(
    collection: string,
    doc: T
  ): Promise<void> => {
    this.collections[collection] ??= {};
    this.collections[collection][doc.id] = doc;
  };

  deleteDocument = async (collection: string, id: string): Promise<void> => {
    delete this.collections[collection][id];
    if (!Object.keys(this.collections).length) {
      delete this.collections[collection];
    }
  };

  getDocument = async <T extends Document>(
    collection: string,
    id: string
  ): Promise<T | null> => {
    return (this.collections[collection]?.[id] as T | undefined) ?? null;
  };

  getDocuments = async <T extends Document>(
    collection: string,
    conditions: Record<string, string | null>
  ): Promise<T[]> => {
    const results: T[] = [];
    for (const id of Object.keys(this.collections[collection] ?? [])) {
      const doc = this.collections[collection][id];
      let matched = true;
      for (const attribute of Object.keys(conditions)) {
        if (doc[attribute] !== conditions[attribute]) {
          matched = false;
          break;
        }
      }
      if (matched) {
        results.push(doc as T);
      }
    }
    return results;
  };

  updateDocument = async <T extends Document>(
    collection: string,
    id: string,
    updates: Partial<T>
  ): Promise<void> => {
    this.collections[collection][id] = {
      ...this.collections[collection][id],
      ...updates,
    };
  };
}
