export type AuthProperties = {
  mainKey: ArrayBuffer;
  salt: ArrayBuffer;
};

export type Folder = {
  folderId: string | null;
  id: string;
  name: string;
  ownerId: string;
  type: "folder";
};

export type FolderEntry = Folder;
