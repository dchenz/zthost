export interface BlobStorage {
  getBlob: (id: string, onProgress: (loaded: number) => void) => Promise<Blob>;
  putBlob: (
    blob: Blob,
    onProgress: (loaded: number) => void
  ) => Promise<string>;
}
