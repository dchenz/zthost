export interface BlobStorage {
  getBlob: (id: string) => Promise<Blob>;
  putBlob: (
    blob: Blob,
    onProgress: (loaded: number, total: number) => void
  ) => Promise<string>;
}
