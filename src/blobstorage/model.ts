export interface BlobStorage {
  getBlob: (id: string) => Promise<Blob>;
  putBlob: (blob: Blob) => Promise<string>;
}
