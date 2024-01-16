import { useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import { CHUNK_SIZE } from "../../config";
import { BlobStorageDispatcher } from "../../database/blobstorage";
import { blobToDataUri, generateThumbnail } from "../../utils";
import { encrypt, generateWrappedKey } from "../../utils/crypto";
import { addUploadTask, updateTask } from "../taskSlice";
import { getSignedInUser } from "../userSlice";
import { databaseApi } from "./api";
import type { FileChunkKey, FolderEntry } from "../../database/model";
import type { AppDispatch, RootState } from "../../store";

const storage = new BlobStorageDispatcher();

export const {
  useCreateFolderMutation,
  useGetThumbnailQuery,
  useGetUserAuthQuery,
} = databaseApi;

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

const deleteFile = (fileId: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    // Get file chunks and use the IDs to delete the blobs in storage.
    const { data: chunks } = await dispatch(
      databaseApi.endpoints.getFileChunks.initiate({ fileId })
    );
    const operations: Promise<void>[] = [];
    if (chunks) {
      for (const chunk of chunks.chunks) {
        operations.push(
          storage.deleteBlob(state.user.storageStrategy!, chunk.id)
        );
      }
    }
    // Delete the documents in the database.
    operations.push(
      dispatch(
        databaseApi.endpoints.deleteFileChunks.initiate({ fileId })
      ).unwrap(),
      dispatch(
        databaseApi.endpoints.deleteThumbnail.initiate({ fileId })
      ).unwrap(),
      dispatch(databaseApi.endpoints.deleteFile.initiate({ fileId })).unwrap()
    );
    await Promise.all(operations);
  };
};

const deleteFolder = (folderId: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const filterSubItems = {
      folderId,
      ownerId: state.user.user!.uid,
    };
    // Recursively delete contents of the folder before deleting it.
    const operations: Promise<void>[] = [];
    const filesToDelete = await dispatch(
      databaseApi.endpoints.getFiles.initiate(filterSubItems)
    ).unwrap();
    for (const subFile of filesToDelete) {
      operations.push(dispatch(deleteFile(subFile.id)));
    }
    const foldersToDelete = await dispatch(
      databaseApi.endpoints.getFolders.initiate(filterSubItems)
    ).unwrap();
    for (const subFolder of foldersToDelete) {
      operations.push(dispatch(deleteFolder(subFolder.id)));
    }
    await Promise.all(operations);
    await dispatch(databaseApi.endpoints.deleteFolder.initiate({ folderId }));
  };
};

export const deleteFIlesAndFolders = (items: FolderEntry[]) => {
  return async (dispatch: AppDispatch) => {
    await Promise.all(
      items.map((item) =>
        dispatch(
          item.type === "file" ? deleteFile(item.id) : deleteFolder(item.id)
        )
      )
    );
  };
};
