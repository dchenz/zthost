import {
  putGoogleDriveBlob,
  deleteGoogleDriveBlob,
  getGoogleDriveBlob,
  createGoogleDriveFolder,
} from "./googledrive";
import type { GoogleDriveInfo } from "./googledrive";

export type StorageProvider = GoogleDriveInfo;

export class BlobStorageDispatcher {
  async createBucket(s: StorageProvider): Promise<string> {
    switch (s.type) {
      case "google":
        return createGoogleDriveFolder(s);
      default:
        throw new Error("Unknown provider");
    }
  }

  async deleteBlob(s: StorageProvider, id: string): Promise<void> {
    switch (s.type) {
      case "google":
        return deleteGoogleDriveBlob(s, id);
      default:
        throw new Error("Unknown provider");
    }
  }

  async getBlob(
    s: StorageProvider,
    id: string,
    onProgress: (loaded: number) => void
  ): Promise<ArrayBuffer> {
    switch (s.type) {
      case "google":
        return getGoogleDriveBlob(s, id, onProgress);
      default:
        throw new Error("Unknown provider");
    }
  }

  async putBlob(
    s: StorageProvider,
    blob: ArrayBuffer,
    onProgress: (loaded: number) => void
  ): Promise<string> {
    switch (s.type) {
      case "google":
        return putGoogleDriveBlob(s, blob, onProgress);
      default:
        throw new Error("Unknown provider");
    }
  }
}
