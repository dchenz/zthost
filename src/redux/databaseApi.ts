import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Firestore } from "../database/firestore";
import type {
  FileDocument,
  FolderDocument,
  ThumbnailsDocument,
  UserAuthDocument,
} from "../database/model";

const database = new Firestore();

export const databaseApi = createApi({
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
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
