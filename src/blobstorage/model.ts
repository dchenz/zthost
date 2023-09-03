export interface BlobStorage {
  deleteBlob: (id: string) => Promise<void>;
  getBlob: (
    id: string,
    onProgress: (loaded: number) => void
  ) => Promise<ArrayBuffer>;
  putBlob: (
    blob: ArrayBuffer,
    onProgress: (loaded: number) => void
  ) => Promise<string>;
}
