import React, { createContext, useCallback, useContext } from "react";
import { useSelector } from "react-redux";
import streamSaver from "streamsaver";
import { Buffer } from "buffer";
import {
  type Database,
  type FileEntity,
  type Folder,
  type UserAuthDocument,
} from "../database/model";
import { getCurrentUser } from "../redux/userSlice";
import { decrypt, unWrapKey } from "../utils/crypto";
import type { AppCollections } from "../database/model";

type DatabaseContext = {
  createUserAuth: (userAuth: UserAuthDocument) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  downloadFileInMemory: (fileId: string) => Promise<ArrayBuffer | null>;
  downloadFileToDisk: (
    file: FileEntity,
    onProgress: (progress: number) => void
  ) => Promise<void>;
  getUserAuth: (userId: string) => Promise<UserAuthDocument | null>;
  moveFile: (fileId: string, targetFolderId: string | null) => Promise<void>;
  moveFolder: (
    folderId: string,
    targetFolderId: string | null
  ) => Promise<void>;
  updateUserAuth: (
    userId: string,
    userAuth: Partial<UserAuthDocument>
  ) => Promise<void>;
};

const Context = createContext<DatabaseContext | undefined>(undefined);

export const useDatabase = () => {
  const ctx = useContext(Context);
  if (ctx === undefined) {
    throw new Error("Context not found");
  }
  return ctx;
};

type DatabaseProviderProps = {
  children: React.ReactNode;
  database: Database<AppCollections>;
};

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
  database,
}) => {
  const { user, userAuth, storage } = useSelector(getCurrentUser);

  const createUserAuth = useCallback(
    async (userAuth: UserAuthDocument): Promise<void> => {
      await database.createDocument("userAuth", userAuth);
    },
    [database]
  );

  const deleteFile = useCallback(
    async (fileId: string): Promise<void> => {
      if (!storage) {
        throw new Error();
      }
      const fileChunksDoc = await database.getDocument("fileChunks", fileId);
      const operations: Promise<void>[] = [];
      if (fileChunksDoc) {
        for (const chunk of fileChunksDoc.chunks) {
          storage.deleteBlob(chunk.id);
        }
      }
      operations.push(database.deleteDocument("fileChunks", fileId));
      operations.push(database.deleteDocument("thumbnails", fileId));
      await Promise.all(operations);
      await database.deleteDocument("files", fileId);
    },
    [database, storage]
  );

  const getFileChunk = useCallback(
    async (
      chunk: { id: string; key: string },
      onProgress: (loaded: number) => void
    ): Promise<ArrayBuffer> => {
      if (!userAuth || !storage) {
        throw new Error();
      }
      const key = await unWrapKey(
        Buffer.from(chunk.key, "base64"),
        userAuth.fileKey
      );
      if (!key) {
        throw new Error("Unable to un-wrap file chunk key");
      }
      const encryptedChunkData = await storage.getBlob(chunk.id, onProgress);
      const chunkData = await decrypt(encryptedChunkData, key);
      if (!chunkData) {
        throw new Error("Unable to decrypt file chunk");
      }
      return chunkData;
    },
    [userAuth, storage]
  );

  const downloadFileToDisk = useCallback(
    async (
      file: FileEntity,
      onProgress: (progress: number) => void
    ): Promise<void> => {
      const fileChunksDoc = await database.getDocument("fileChunks", file.id);
      if (!fileChunksDoc?.chunks) {
        throw new Error("Unable to find file chunks");
      }
      const fileStream = streamSaver.createWriteStream(file.metadata.name, {
        size: file.metadata.size,
      });
      const writer = fileStream.getWriter();
      try {
        const downloadProgress: Record<number, number> = {};
        const onChunkProgress = (i: number) => (loaded: number) => {
          downloadProgress[i] = loaded;
          let loadedAllChunks = 0;
          for (const progress of Object.values(downloadProgress)) {
            loadedAllChunks += progress;
          }
          onProgress(loadedAllChunks / file.metadata.size);
        };
        for (let i = 0; i < fileChunksDoc.chunks.length; i++) {
          const chunkData = await getFileChunk(
            fileChunksDoc.chunks[i],
            onChunkProgress(i)
          );
          await writer.write(new Uint8Array(chunkData));
        }
      } catch (e) {
        await writer.abort();
        throw e;
      }
      await writer.close();
    },
    [database, getFileChunk]
  );

  // Downloading files in-memory is only supported for files with one chunk.
  const downloadFileInMemory = useCallback(
    async (fileId: string): Promise<ArrayBuffer | null> => {
      const fileChunksDoc = await database.getDocument("fileChunks", fileId);
      if (!fileChunksDoc?.chunks) {
        throw new Error("Unable to find file chunks");
      }
      if (fileChunksDoc.chunks.length > 1) {
        return null;
      }
      return await getFileChunk(fileChunksDoc.chunks[0], () => undefined);
    },
    [database, getFileChunk]
  );

  const getFilesInFolder = useCallback(
    async (folderId: string | null): Promise<FileEntity[]> => {
      if (!user || !userAuth) {
        throw new Error();
      }
      const filesInFolder = await database.getDocuments("files", {
        ownerId: user.uid,
        folderId: folderId,
      });
      const results: FileEntity[] = [];
      for (const file of filesInFolder) {
        const decryptedMetadata = await decrypt(
          Buffer.from(file.metadata, "base64"),
          userAuth.metadataKey
        );
        if (!decryptedMetadata) {
          throw new Error(`Unable to decrypt file ${file.id}`);
        }
        const metadata = JSON.parse(
          Buffer.from(decryptedMetadata).toString("utf-8")
        );
        results.push({
          id: file.id,
          creationTime: new Date(file.creationTime),
          folderId: file.folderId,
          hasThumbnail: file.hasThumbnail,
          ownerId: file.ownerId,
          metadata,
          type: "file",
        } as FileEntity);
      }
      return results;
    },
    [database, user, userAuth]
  );

  const getFoldersInFolder = useCallback(
    async (folderId: string | null): Promise<Folder[]> => {
      if (!user || !userAuth) {
        throw new Error();
      }
      const foldersInFolder = await database.getDocuments("folders", {
        ownerId: user.uid,
        folderId: folderId,
      });
      const results: Folder[] = [];
      for (const folder of foldersInFolder) {
        const decryptedMetadata = await decrypt(
          Buffer.from(folder.metadata, "base64"),
          userAuth.metadataKey
        );
        if (!decryptedMetadata) {
          throw new Error(`Unable to decrypt folder ${folder.id}`);
        }
        const metadata = JSON.parse(
          Buffer.from(decryptedMetadata).toString("utf-8")
        );
        results.push({
          id: folder.id,
          creationTime: new Date(folder.creationTime),
          folderId: folder.folderId,
          ownerId: folder.ownerId,
          metadata,
          type: "folder",
        });
      }
      return results;
    },
    [database, user, userAuth]
  );

  const deleteFolder = useCallback(
    async (folderId: string): Promise<void> => {
      const operations: Promise<void>[] = [];
      // Delete files and metadata of files inside the folder.
      const filesToDelete = await getFilesInFolder(folderId);
      for (const file of filesToDelete) {
        operations.push(deleteFile(file.id));
      }
      // Recursively delete folders inside folder.
      const foldersToDelete = await getFoldersInFolder(folderId);
      for (const folder of foldersToDelete) {
        operations.push(deleteFolder(folder.id));
      }
      await Promise.all(operations);
      await database.deleteDocument("folders", folderId);
    },
    [database, getFilesInFolder, getFoldersInFolder]
  );

  const getUserAuth = useCallback(
    async (userId: string): Promise<UserAuthDocument | null> => {
      return await database.getDocument("userAuth", userId);
    },
    [database]
  );

  const moveFile = useCallback(
    async (fileId: string, targetFolderId: string | null): Promise<void> => {
      await database.updateDocument("files", fileId, {
        folderId: targetFolderId,
      });
    },
    [database]
  );

  const moveFolder = useCallback(
    async (folderId: string, targetFolderId: string | null): Promise<void> => {
      await database.updateDocument("folders", folderId, {
        folderId: targetFolderId,
      });
    },
    [database]
  );

  const updateUserAuth = useCallback(
    async (
      userId: string,
      userAuth: Partial<UserAuthDocument>
    ): Promise<void> => {
      await database.updateDocument("userAuth", userId, userAuth);
    },
    [database]
  );

  return (
    <Context.Provider
      value={{
        createUserAuth,
        deleteFile,
        deleteFolder,
        downloadFileInMemory,
        downloadFileToDisk,
        getUserAuth,
        moveFile,
        moveFolder,
        updateUserAuth,
      }}
    >
      {children}
    </Context.Provider>
  );
};
