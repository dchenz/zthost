import React, { createContext, useCallback, useContext } from "react";
import { useSelector } from "react-redux";
import streamSaver from "streamsaver";
import { v4 as uuid } from "uuid";
import { Buffer } from "buffer";
import { CHUNK_SIZE } from "../config";
import {
  type Database,
  type FileEntity,
  type Folder,
  type FolderMetadata,
  type UserAuthDocument,
} from "../database/model";
import { getCurrentUser } from "../redux/userSlice";
import { blobToDataUri, generateThumbnail } from "../utils";
import {
  decrypt,
  encrypt,
  generateWrappedKey,
  unWrapKey,
} from "../utils/crypto";
import type { AppCollections, FileMetadata } from "../database/model";

type DatabaseContext = {
  createFileChunks: (
    fileId: string,
    file: File,
    onProgress: (progress: number) => void
  ) => Promise<void>;
  createFileMetadata: (
    fileId: string,
    file: File,
    parentFolderId: string
  ) => Promise<FileEntity>;
  createFolder: (
    name: string,
    parentFolderId: string | null
  ) => Promise<Folder>;
  createThumbnail: (fileId: string, dataUri: string) => Promise<void>;
  createUserAuth: (userAuth: UserAuthDocument) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  downloadFileInMemory: (fileId: string) => Promise<ArrayBuffer | null>;
  downloadFileToDisk: (
    file: FileEntity,
    onProgress: (progress: number) => void
  ) => Promise<void>;
  getThumbnail: (fileId: string) => Promise<string>;
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

  const encryptAndUploadChunk = useCallback(
    async (
      file: File,
      chunkNumber: number,
      onProgress: (loaded: number) => void
    ): Promise<{ id: string; key: string }> => {
      if (!userAuth || !storage) {
        throw new Error();
      }
      const chunk = file.slice(
        chunkNumber * CHUNK_SIZE,
        (chunkNumber + 1) * CHUNK_SIZE
      );
      const { plainTextKey, wrappedKey } = await generateWrappedKey(
        userAuth.fileKey
      );
      const encryptedChunk = await encrypt(
        await chunk.arrayBuffer(),
        plainTextKey
      );
      const blobId = await storage.putBlob(encryptedChunk, onProgress);
      return {
        id: blobId,
        key: Buffer.from(wrappedKey).toString("base64"),
      };
    },
    [userAuth, storage]
  );

  const createFileChunks = useCallback(
    async (
      fileId: string,
      file: File,
      onProgress: (progress: number) => void
    ): Promise<void> => {
      const nChunks = Math.ceil(file.size / CHUNK_SIZE);
      // Aggregate the upload progress across all chunks and pass it to the
      // callback to report overall upload progress.
      const uploadProgress: Record<number, number> = {};
      const onChunkProgress = (chunkNumber: number) => (loaded: number) => {
        uploadProgress[chunkNumber] = loaded;
        let loadedAllChunks = 0;
        for (const progress of Object.values(uploadProgress)) {
          loadedAllChunks += progress;
        }
        // Uploaded chunks have a 12 byte header and 16 byte trailer.
        const realUploadSize = file.size + nChunks * 28;
        onProgress(loadedAllChunks / realUploadSize);
      };
      const uploads: Promise<{ id: string; key: string }>[] = [];
      for (let i = 0; i < nChunks; i++) {
        uploads.push(encryptAndUploadChunk(file, i, onChunkProgress(i)));
      }
      const results = await Promise.all(uploads);
      await database.createDocument("fileChunks", {
        id: fileId,
        chunks: results.map(({ id, key }) => ({ id, key })),
      });
    },
    [database, encryptAndUploadChunk]
  );

  const createFolder = useCallback(
    async (name: string, parentFolderId: string | null): Promise<Folder> => {
      if (!user || !userAuth) {
        throw new Error();
      }
      const id = uuid();
      const creationTime = new Date();
      const metadata: FolderMetadata = {
        name,
      };
      const encryptedMetadata = await encrypt(
        Buffer.from(JSON.stringify(metadata), "utf-8"),
        userAuth.metadataKey
      );
      await database.createDocument("folders", {
        id,
        creationTime: creationTime.getTime(),
        metadata: Buffer.from(encryptedMetadata).toString("base64"),
        ownerId: user.uid,
        folderId: parentFolderId,
      });
      return {
        id,
        creationTime,
        folderId: parentFolderId,
        metadata,
        ownerId: user.uid,
        type: "folder",
      };
    },
    [database, user, userAuth]
  );

  const createThumbnail = useCallback(
    async (fileId: string, dataUri: string): Promise<void> => {
      if (!userAuth) {
        throw new Error();
      }
      const encryptedThumbnail = await encrypt(
        Buffer.from(dataUri, "utf-8"),
        userAuth.thumbnailKey
      );
      await database.createDocument("thumbnails", {
        id: fileId,
        data: Buffer.from(encryptedThumbnail).toString("base64"),
      });
    },
    [database, userAuth]
  );

  const createFileMetadata = useCallback(
    async (
      fileId: string,
      file: File,
      parentFolderId: string
    ): Promise<FileEntity> => {
      if (!user || !userAuth) {
        throw new Error();
      }
      const creationTime = new Date();
      const metadata: FileMetadata = {
        name: file.name,
        size: file.size,
        type: file.type,
      };
      const encryptedMetadata = await encrypt(
        Buffer.from(JSON.stringify(metadata), "utf-8"),
        userAuth.metadataKey
      );
      const thumbnail = await generateThumbnail(file);
      await database.createDocument("files", {
        id: fileId,
        creationTime: creationTime.getTime(),
        folderId: parentFolderId,
        hasThumbnail: thumbnail !== null,
        metadata: Buffer.from(encryptedMetadata).toString("base64"),
        ownerId: user.uid,
      });
      if (thumbnail) {
        const dataUri = await blobToDataUri(thumbnail);
        await createThumbnail(fileId, dataUri);
      }
      return {
        id: fileId,
        creationTime,
        hasThumbnail: thumbnail !== null,
        folderId: parentFolderId,
        metadata,
        ownerId: user.uid,
        type: "file",
      };
    },
    [database, user, userAuth, createThumbnail]
  );

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

  const getThumbnail = useCallback(
    async (fileId: string): Promise<string> => {
      if (!userAuth) {
        throw new Error();
      }
      const thumbnailDoc = await database.getDocument("thumbnails", fileId);
      if (!thumbnailDoc) {
        return "";
      }
      const dataUri = await decrypt(
        Buffer.from(thumbnailDoc.data, "base64"),
        userAuth.thumbnailKey
      );
      if (!dataUri) {
        throw new Error("Unable to decrypt thumbnail");
      }
      return Buffer.from(dataUri).toString("utf-8");
    },
    [database, userAuth]
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
        createFileChunks,
        createFileMetadata,
        createFolder,
        createThumbnail,
        createUserAuth,
        deleteFile,
        deleteFolder,
        downloadFileInMemory,
        downloadFileToDisk,
        getThumbnail,
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
