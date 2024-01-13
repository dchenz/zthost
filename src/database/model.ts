export type User = {
  photoURL?: string;
  uid: string;
};

export type AuthProperties = {
  // ID indicating where file chunk data is stored on the blob storage backend.
  // For google drive, this is a folder ID.
  bucketId: string;
  // Used to encrypt keys of file chunks uploaded to blob storage.
  fileKey: ArrayBuffer;
  // Used to encrypt metadata for files and folders.
  metadataKey: ArrayBuffer;
  // Used to salt the user's password.
  salt: ArrayBuffer;
  // Used to encrypt thumbnail data uploaded to firebase.
  thumbnailKey: ArrayBuffer;
};

export type FolderMetadata = {
  name: string;
};

export type Folder = {
  creationTime: Date;
  folderId: string | null;
  id: string;
  metadata: FolderMetadata;
  ownerId: string;
  type: "folder";
};

export type FileMetadata = {
  name: string;
  size: number;
  type: string;
};

export type FileEntity = {
  creationTime: Date;
  folderId: string | null;
  hasThumbnail: boolean;
  id: string;
  metadata: FileMetadata;
  ownerId: string;
  type: "file";
};

export type FolderEntry = Folder | FileEntity;

export type Document = { id: string };

export interface Database<Collections extends Record<string, Document>> {
  createDocument: <T extends keyof Collections>(
    collectionName: T,
    document: Collections[T]
  ) => Promise<void>;
  deleteDocument: <T extends keyof Collections>(
    collectionName: T,
    documentId: string
  ) => Promise<void>;
  getDocument: <T extends keyof Collections>(
    collectionName: T,
    documentId: string
  ) => Promise<Collections[T] | null>;
  getDocuments: <T extends keyof Collections>(
    collectionName: T,
    conditions: Partial<Collections[T]>
  ) => Promise<Collections[T][]>;
  updateDocument: <T extends keyof Collections>(
    collectionName: T,
    documentId: string,
    updates: Partial<Collections[T]>
  ) => Promise<void>;
}

export type AppCollections = {
  fileChunks: FileChunksDocument;
  files: FileDocument;
  folders: FolderDocument;
  thumbnails: ThumbnailsDocument;
  userAuth: UserAuthDocument;
};

export type UserAuthDocument = {
  bucketId: string;
  fileKey: string;
  id: string;
  metadataKey: string;
  salt: string;
  thumbnailKey: string;
};

export type FolderDocument = {
  creationTime: number;
  folderId: string | null;
  id: string;
  metadata: string;
  ownerId: string;
};

export type FileDocument = {
  creationTime: number;
  folderId: string | null;
  hasThumbnail: boolean;
  id: string;
  metadata: string;
  ownerId: string;
};

export type FileChunkKey = {
  id: string;
  key: string;
};

export type FileChunksDocument = {
  chunks: FileChunkKey[];
  id: string;
};

export type ThumbnailsDocument = {
  data: string;
  id: string;
};

export interface BlobStorage {
  deleteBlob: (id: string) => Promise<void>;
  getBlob: (
    id: string,
    onProgress: (loaded: number) => void
  ) => Promise<ArrayBuffer>;
  initialize: () => Promise<string>;
  putBlob: (
    blob: ArrayBuffer,
    onProgress: (loaded: number) => void
  ) => Promise<string>;
}
