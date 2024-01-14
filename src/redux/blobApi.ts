import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Buffer } from "buffer";
import { encrypt, generateWrappedKey } from "../utils/crypto";
import type {
  AuthProperties,
  BlobStorage,
  FileChunkKey,
} from "../database/model";

type UserState = {
  user: { storage: BlobStorage | null; userAuth: AuthProperties | null };
};

type CreateChunkQuery = {
  blob: Blob;
  onProgress: (n: number) => void;
};

export const blobApi = createApi({
  reducerPath: "blobApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    createChunk: builder.mutation<FileChunkKey, CreateChunkQuery>({
      queryFn: async ({ blob, onProgress }, api) => {
        const state = api.getState() as UserState;
        const { plainTextKey, wrappedKey } = await generateWrappedKey(
          state.user.userAuth!.fileKey
        );
        const encryptedChunk = await encrypt(
          await blob.arrayBuffer(),
          plainTextKey
        );
        const blobId = await state.user.storage!.putBlob(
          encryptedChunk,
          onProgress
        );
        return {
          data: {
            id: blobId,
            key: Buffer.from(wrappedKey).toString("base64"),
          },
        };
      },
    }),

    getChunk: builder.query<void, void>({
      queryFn: async () => {
        return { data: undefined };
      },
    }),

    deleteChunk: builder.mutation<void, void>({
      queryFn: async () => {
        return { data: undefined };
      },
    }),
  }),
});
