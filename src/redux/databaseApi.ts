import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { useSelector } from "react-redux";
import { Buffer } from "buffer";
import { Firestore } from "../database/firestore";
import {
  type FileDocument,
  type FileEntity,
  type FolderDocument,
  type ThumbnailsDocument,
  type UserAuthDocument,
} from "../database/model";
import { decrypt } from "../utils/crypto";
import { getSignedInUser } from "./userSlice";
import type { Folder } from "../database/model";
import type { RootState } from "../store";

const database = new Firestore();

const TAGS = {
  contentsFiles: "contents/files",
  contentsFolders: "contents/folders",
};

export const databaseApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: Object.values(TAGS),
  endpoints: (builder) => ({
    getFiles: builder.query<
      FileEntity[],
      Pick<FileDocument, "ownerId" | "folderId">
    >({
      queryFn: async (filter, api) => {
        const state = api.getState() as RootState;
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
        const state = api.getState() as RootState;
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

    createFolder: builder.mutation<void, FolderDocument>({
      queryFn: async (folder) => {
        return { data: await database.createDocument("folders", folder) };
      },
    }),

    getThumbnail: builder.query<ThumbnailsDocument | null, { fileId: string }>({
      queryFn: async ({ fileId }) => {
        return { data: await database.getDocument("thumbnails", fileId) };
      },
    }),

    createThumbnail: builder.mutation<void, ThumbnailsDocument>({
      queryFn: async (thumbnail) => {
        return { data: await database.createDocument("thumbnails", thumbnail) };
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
