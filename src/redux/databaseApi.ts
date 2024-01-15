import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import { Buffer } from "buffer";
import { CHUNK_SIZE } from "../config";
import { BlobStorageDispatcher } from "../database/blobstorage";
import { Firestore } from "../database/firestore";
import {
  type FileDocument,
  type FileEntity,
  type FolderDocument,
  type UserAuthDocument,
} from "../database/model";
import { blobToDataUri, generateThumbnail } from "../utils";
import { decrypt, encrypt, generateWrappedKey } from "../utils/crypto";
import {
  addFileToCache,
  addFolderToCache,
  addThumbnailToCache,
} from "./cacheUtils";
import { addUploadTask, updateTask } from "./taskSlice";
import { getSignedInUser } from "./userSlice";
import type {
  AuthProperties,
  FileChunkKey,
  FileChunksDocument,
  Folder,
  FolderMetadata,
  User,
} from "../database/model";
import type { AppDispatch, RootState } from "../store";

type UserState = {
  user: { user: User | null; userAuth: AuthProperties | null };
};

const database = new Firestore();
const storage = new BlobStorageDispatcher();

const TAGS = {
  contentsFiles: "contents/files",
  contentsFolders: "contents/folders",
  thumbnails: "thumbnails",
};

export const databaseApi = createApi({
  reducerPath: "databaseApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: Object.values(TAGS),
  endpoints: (builder) => ({
    getFiles: builder.query<
      FileEntity[],
      Pick<FileDocument, "ownerId" | "folderId">
    >({
      queryFn: async (filter, api) => {
        const state = api.getState() as UserState;
        const results: FileEntity[] = [];
        for (const file of await database.getDocuments("files", filter)) {
          const decryptedMetadata = await decrypt(
            Buffer.from(file.metadata, "base64"),
            state.user.userAuth!.metadataKey
          );
          if (!decryptedMetadata) {
            throw new Error(`Unable to decrypt file ${file.id}`);
          }
          const metadata = JSON.parse(
            Buffer.from(decryptedMetadata).toString("utf-8")
          );
          results.push({
            id: file.id,
            creationTime: file.creationTime,
            folderId: file.folderId,
            hasThumbnail: file.hasThumbnail,
            ownerId: file.ownerId,
            metadata,
            type: "file",
          } as FileEntity);
        }
        return { data: results };
      },
      providesTags: (result, error, { folderId }) => [
        { type: TAGS.contentsFiles, id: folderId ?? "" },
      ],
    }),

    getFolders: builder.query<
      Folder[],
      Pick<FolderDocument, "ownerId" | "folderId">
    >({
      queryFn: async (filter, api) => {
        const state = api.getState() as UserState;
        const foldersInFolder = await database.getDocuments("folders", filter);
        const results: Folder[] = [];
        for (const folder of foldersInFolder) {
          const decryptedMetadata = await decrypt(
            Buffer.from(folder.metadata, "base64"),
            state.user.userAuth!.metadataKey
          );
          if (!decryptedMetadata) {
            throw new Error(`Unable to decrypt folder ${folder.id}`);
          }
          const metadata = JSON.parse(
            Buffer.from(decryptedMetadata).toString("utf-8")
          );
          results.push({
            id: folder.id,
            creationTime: folder.creationTime,
            folderId: folder.folderId,
            ownerId: folder.ownerId,
            metadata,
            type: "folder",
          });
        }
        return { data: results };
      },
      providesTags: (result, error, { folderId }) => [
        { type: TAGS.contentsFolders, id: folderId ?? "" },
      ],
    }),

    createFile: builder.mutation<void, FileEntity>({
      queryFn: async (file, api) => {
        const state = api.getState() as UserState;
        const encryptedMetadata = await encrypt(
          Buffer.from(JSON.stringify(file.metadata), "utf-8"),
          state.user.userAuth!.metadataKey
        );
        await database.createDocument("files", {
          ...file,
          metadata: Buffer.from(encryptedMetadata).toString("base64"),
        });
        return { data: undefined };
      },
      onQueryStarted: async (args, { queryFulfilled, dispatch }) => {
        await queryFulfilled;
        dispatch(addFileToCache(args));
      },
    }),

    createFolder: builder.mutation<
      Folder,
      { name: string; parentFolderId: string }
    >({
      queryFn: async ({ name, parentFolderId }, api) => {
        const state = api.getState() as UserState;
        const id = uuid();
        const creationTime = Date.now();
        const metadata: FolderMetadata = {
          name,
        };
        const encryptedMetadata = await encrypt(
          Buffer.from(JSON.stringify(metadata), "utf-8"),
          state.user.userAuth!.metadataKey
        );
        await database.createDocument("folders", {
          id,
          creationTime,
          metadata: Buffer.from(encryptedMetadata).toString("base64"),
          ownerId: state.user.user!.uid,
          folderId: parentFolderId,
        });
        return {
          data: {
            id,
            creationTime,
            folderId: parentFolderId,
            metadata,
            ownerId: state.user.user!.uid,
            type: "folder",
          },
        };
      },
      onQueryStarted: async (args, { queryFulfilled, dispatch }) => {
        const { data: newFolder } = await queryFulfilled;
        dispatch(addFolderToCache(newFolder));
      },
    }),

    getThumbnail: builder.query<string, { fileId: string }>({
      queryFn: async ({ fileId }, api) => {
        const state = api.getState() as UserState;
        const thumbnailDoc = await database.getDocument("thumbnails", fileId);
        if (!thumbnailDoc) {
          return { data: "" };
        }
        const dataUri = await decrypt(
          Buffer.from(thumbnailDoc.data, "base64"),
          state.user.userAuth!.thumbnailKey
        );
        if (!dataUri) {
          throw new Error("Unable to decrypt thumbnail");
        }
        return { data: Buffer.from(dataUri).toString("utf-8") };
      },
      providesTags: (result, error, { fileId }) => [
        { type: TAGS.thumbnails, id: fileId },
      ],
    }),

    createThumbnail: builder.mutation<
      void,
      { dataUri: string; fileId: string }
    >({
      queryFn: async ({ dataUri, fileId }, api) => {
        const state = api.getState() as UserState;
        const encryptedThumbnail = await encrypt(
          Buffer.from(dataUri, "utf-8"),
          state.user.userAuth!.thumbnailKey
        );
        await database.createDocument("thumbnails", {
          id: fileId,
          data: Buffer.from(encryptedThumbnail).toString("base64"),
        });
        return { data: undefined };
      },
      onQueryStarted: async (
        { dataUri, fileId },
        { queryFulfilled, dispatch }
      ) => {
        await queryFulfilled;
        dispatch(addThumbnailToCache(fileId, dataUri));
      },
    }),

    getUserAuth: builder.query<UserAuthDocument | null, { userId: string }>({
      queryFn: async ({ userId }) => {
        return { data: await database.getDocument("userAuth", userId) };
      },
    }),

    createUserAuth: builder.mutation<void, UserAuthDocument>({
      queryFn: async (userAuth) => {
        return { data: await database.createDocument("userAuth", userAuth) };
      },
    }),

    deleteFile: builder.mutation<void, { fileId: string }>({
      queryFn: async ({ fileId }) => {
        return { data: await database.deleteDocument("files", fileId) };
      },
    }),

    deleteFolder: builder.mutation<void, { folderId: string }>({
      queryFn: async ({ folderId }) => {
        return { data: await database.deleteDocument("folders", folderId) };
      },
    }),

    updateFile: builder.mutation<
      void,
      { fileId: string; updates: Partial<FileDocument> }
    >({
      queryFn: async ({ fileId, updates }) => {
        return {
          data: await database.updateDocument("files", fileId, updates),
        };
      },
    }),

    updateFolder: builder.mutation<
      void,
      { folderId: string; updates: Partial<FolderDocument> }
    >({
      queryFn: async ({ folderId, updates }) => {
        return {
          data: await database.updateDocument("folders", folderId, updates),
        };
      },
    }),

    updateUserAuth: builder.mutation<
      void,
      { updates: Partial<UserAuthDocument>; userId: string }
    >({
      queryFn: async ({ updates, userId }) => {
        return {
          data: await database.updateDocument("userAuth", userId, updates),
        };
      },
    }),

    createFileChunks: builder.mutation<void, FileChunksDocument>({
      queryFn: async (chunks) => {
        await database.createDocument("fileChunks", chunks);
        return { data: undefined };
      },
    }),
  }),
});

export const { useCreateFolderMutation, useGetThumbnailQuery } = databaseApi;

export const useFolderContents = (folderId: string | null) => {
  const { user } = useSelector(getSignedInUser);
  const { data: files = [], isLoading: isLoadingFiles } =
    databaseApi.useGetFilesQuery({ ownerId: user.uid, folderId });
  const { data: folders = [], isLoading: isLoadingFolders } =
    databaseApi.useGetFoldersQuery({ ownerId: user.uid, folderId });

  return {
    data: [...files, ...folders],
    isLoading: isLoadingFiles || isLoadingFolders,
  };
};

const createChunk = async (
  state: RootState,
  blob: Blob,
  onProgress: (n: number) => void
) => {
  const { plainTextKey, wrappedKey } = await generateWrappedKey(
    state.user.userAuth!.fileKey
  );
  const encryptedChunk = await encrypt(await blob.arrayBuffer(), plainTextKey);
  const blobId = await storage.putBlob(
    state.user.storageStrategy!,
    encryptedChunk,
    onProgress
  );
  return {
    id: blobId,
    key: Buffer.from(wrappedKey).toString("base64"),
  };
};

export const uploadFile = (
  fileToUpload: File,
  parentFolderId: string | null
) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const fileId = uuid();
    await dispatch(addUploadTask(fileId, fileToUpload.name));

    // Create a thumbnail for the file if its mimetype is supported.
    const thumbnail = await generateThumbnail(fileToUpload);

    // Store the file metadata in the database.
    await dispatch(
      databaseApi.endpoints.createFile.initiate({
        id: fileId,
        creationTime: Date.now(),
        hasThumbnail: thumbnail !== null,
        folderId: parentFolderId,
        metadata: {
          name: fileToUpload.name,
          size: fileToUpload.size,
          type: fileToUpload.type,
        },
        ownerId: state.user.user!.uid,
        type: "file",
      })
    );

    if (thumbnail) {
      const dataUri = await blobToDataUri(thumbnail);
      await dispatch(
        databaseApi.endpoints.createThumbnail.initiate({ dataUri, fileId })
      );
    }

    // Create chunks for the file's binary data, especially if it's large.
    // Upload each chunk and its metadata to both blob storage and the database.
    const nChunks = Math.ceil(fileToUpload.size / CHUNK_SIZE);
    // Combine the upload progress from all chunks and provide it to the
    // callback to report the overall upload progress.
    const uploadProgress: Record<number, number> = {};
    const onProgress = (chunkNumber: number) => async (loaded: number) => {
      uploadProgress[chunkNumber] = loaded;
      let loadedAllChunks = 0;
      for (const progress of Object.values(uploadProgress)) {
        loadedAllChunks += progress;
      }
      // Uploaded chunks have a 12 byte header and 16 byte trailer.
      const realUploadSize = fileToUpload.size + nChunks * 28;
      await dispatch(
        updateTask({
          id: fileId,
          updates: { progress: loadedAllChunks / realUploadSize },
        })
      );
    };
    const uploads: Promise<FileChunkKey>[] = [];
    for (let i = 0; i < nChunks; i++) {
      const blob = fileToUpload.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      uploads.push(createChunk(state, blob, onProgress));
    }

    // After the chunks have been uploaded, store the encryption keys in the database
    // and link them to the corresponding file record.
    const results = await Promise.all(uploads);
    await dispatch(
      databaseApi.endpoints.createFileChunks.initiate({
        id: fileId,
        chunks: results.map(({ id, key }) => ({ id, key })),
      })
    );
    await dispatch(
      updateTask({
        id: fileId,
        updates: {
          progress: 1,
          ok: true,
          title: fileToUpload.name,
        },
      })
    );
  };
};

export const initializeStorageForNewAccount = (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  return storage.createBucket(getState().user.storageStrategy!);
};
