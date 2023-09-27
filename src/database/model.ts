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

export interface Database {
  createDocument: <T extends Document>(
    collection: string,
    doc: T
  ) => Promise<void>;
  deleteDocument: (collection: string, id: string) => Promise<void>;
  getDocument: <T extends Document>(
    collection: string,
    id: string
  ) => Promise<T | null>;
  getDocuments: <T extends Document>(
    collection: string,
    conditions: Record<string, string | null>
  ) => Promise<T[]>;
  updateDocument: <T extends Document>(
    collection: string,
    id: string,
    updates: Partial<T>
  ) => Promise<void>;
}

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

export type FileChunksDocument = {
  chunks: {
    id: string;
    key: string;
  }[];
  id: string;
};

export type ThumbnailsDocument = {
  data: string;
  id: string;
};
