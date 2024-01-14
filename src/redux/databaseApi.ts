import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import { Buffer } from "buffer";
import { Firestore } from "../database/firestore";
import {
  type FileDocument,
  type FileEntity,
  type FolderDocument,
  type UserAuthDocument,
} from "../database/model";
import { decrypt, encrypt } from "../utils/crypto";
import { addFolderToCache, addThumbnailToCache } from "./cacheUtils";
import { getSignedInUser } from "./userSlice";
import type {
  AuthProperties,
  Folder,
  FolderMetadata,
  User,
} from "../database/model";

type UserState = {
  user: { user: User | null; userAuth: AuthProperties | null };
};

const database = new Firestore();

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
            creationTime: new Date(file.creationTime),
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
            creationTime: new Date(folder.creationTime),
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

    createFile: builder.mutation<void, FileDocument>({
      queryFn: async (file) => {
        return { data: await database.createDocument("files", file) };
      },
    }),

    createFolder: builder.mutation<
      Folder,
      { name: string; parentFolderId: string }
    >({
      queryFn: async ({ name, parentFolderId }, api) => {
        const state = api.getState() as UserState;
        const id = uuid();
        const creationTime = new Date();
        const metadata: FolderMetadata = {
          name,
        };
        const encryptedMetadata = await encrypt(
          Buffer.from(JSON.stringify(metadata), "utf-8"),
          state.user.userAuth!.metadataKey
        );
        await database.createDocument("folders", {
          id,
          creationTime: creationTime.getTime(),
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
