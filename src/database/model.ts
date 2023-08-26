export type AuthProperties = {
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

export type BlobRef = {
  id: string;
  key: string;
};

export type FolderEntry = Folder | FileEntity;
