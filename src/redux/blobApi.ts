import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export const blobApi = createApi({
  reducerPath: "blobApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    createChunk: builder.mutation<void, void>({
      queryFn: async () => {
        return { data: undefined };
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
