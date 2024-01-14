import { databaseApi } from "./databaseApi";
import type { Folder } from "../database/model";

export const addFolderToCache = (folder: Folder) => {
  return databaseApi.util.updateQueryData(
    "getFolders",
    { folderId: folder.folderId, ownerId: folder.ownerId },
    (existingData: Folder[]) => [...existingData, folder]
  );
};

export const removeFolderFromCache = (
  folderId: string,
  parentFolderId: string | null,
  ownerId: string
) => {
  return databaseApi.util.updateQueryData(
    "getFolders",
    { folderId: parentFolderId, ownerId },
    (existingData: Folder[]) => existingData.filter((f) => f.id !== folderId)
  );
};
