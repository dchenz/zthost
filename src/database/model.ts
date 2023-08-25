export type AuthProperties = {
  mainKey: ArrayBuffer;
  salt: ArrayBuffer;
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
