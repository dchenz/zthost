import { databaseApi } from "./databaseApi";
import type { FileEntity, Folder } from "../database/model";

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

export const addThumbnailToCache = (fileId: string, dataUri: string) => {
  return databaseApi.util.upsertQueryData("getThumbnail", { fileId }, dataUri);
};

export const addFileToCache = (file: FileEntity) => {
  return databaseApi.util.updateQueryData(
    "getFiles",
    { folderId: file.folderId, ownerId: file.ownerId },
    (existingData: FileEntity[]) => [...existingData, file]
  );
};
