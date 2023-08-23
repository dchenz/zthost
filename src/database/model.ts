export type AuthProperties = {
  mainKey: ArrayBuffer;
  salt: ArrayBuffer;
};

export type FolderMetadata = {
  name: string;
};

export type Folder = {
  folderId: string | null;
  id: string;
  metadata: FolderMetadata;
  ownerId: string;
  type: "folder";
};

export type FolderEntry = Folder;
