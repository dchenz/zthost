import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import streamSaver from "streamsaver";
import { v4 as uuid } from "uuid";
import { Buffer } from "buffer";
import { CHUNK_SIZE, THUMBNAIL_SIZE, fstore } from "../config";
import {
  blobToDataUri,
  createImageThumbnail,
  isImage,
  isVideo,
  createVideoThumbnail,
} from "../utils";
import {
  decrypt,
  encrypt,
  generateWrappedKey,
  unWrapKey,
} from "../utils/crypto";
import type {
  AuthProperties,
  BlobRef,
  FileEntity,
  FileMetadata,
  Folder,
  FolderEntry,
  FolderMetadata,
} from "./model";
import type { BlobStorage } from "../blobstorage/model";
import type { User } from "firebase/auth";

export class FileHandler {
  storageBackend: BlobStorage;
  userAuth: AuthProperties;
  ownerId: string;

  constructor(
    storageBackend: BlobStorage,
    userAuth: AuthProperties,
    user: User
  ) {
    this.storageBackend = storageBackend;
    this.userAuth = userAuth;
    this.ownerId = user.uid;
  }

  async downloadThumbnail(fileId: string): Promise<string | null> {
    const thumbnailDoc = await getDoc(doc(fstore, "thumbnails", fileId));
    const encryptedThumbnail = thumbnailDoc.get("data");
    if (!encryptedThumbnail) {
      return null;
    }
    const thumbnail = await decrypt(
      Buffer.from(encryptedThumbnail, "base64"),
      this.userAuth.thumbnailKey
    );
    if (!thumbnail) {
      throw new Error("Unable to decrypt thumbnail");
    }
    return Buffer.from(thumbnail).toString("utf-8");
  }

  async uploadThumbnail(fileId: string, file: File): Promise<void> {
    let thumbnail;
    if (isImage(file.type)) {
      thumbnail = await blobToDataUri(
        await createImageThumbnail(file, THUMBNAIL_SIZE)
      );
    } else if (isVideo(file.type)) {
      thumbnail = await blobToDataUri(await createVideoThumbnail(file));
    }
    if (!thumbnail) {
      return;
    }
    const encryptedThumbnail = await encrypt(
      Buffer.from(thumbnail, "utf-8"),
      this.userAuth.thumbnailKey
    );
    await setDoc(doc(fstore, "thumbnails", fileId), {
      data: Buffer.from(encryptedThumbnail).toString("base64"),
    });
  }

  async uploadFileMetadata(
    fileId: string,
    file: File,
    parentFolderId: string
  ): Promise<FileEntity> {
    const creationTime = new Date();
    const metadata: FileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
    };
    const encryptedMetadata = await encrypt(
      Buffer.from(JSON.stringify(metadata), "utf-8"),
      this.userAuth.metadataKey
    );
    const hasThumbnail = isImage(file.type) || isVideo(file.type);
    await setDoc(doc(fstore, "files", fileId), {
      creationTime: creationTime.getTime(),
      folderId: parentFolderId,
      hasThumbnail,
      metadata: Buffer.from(encryptedMetadata).toString("base64"),
      ownerId: this.ownerId,
    });
    if (hasThumbnail) {
      await this.uploadThumbnail(fileId, file);
    }
    return {
      id: fileId,
      creationTime,
      hasThumbnail,
      folderId: parentFolderId,
      metadata,
      ownerId: this.ownerId,
      type: "file",
    };
  }

  async uploadFileChunks(
    fileId: string,
    file: File,
    onProgress: (progress: number) => void
  ): Promise<void> {
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
    const uploads: Promise<BlobRef>[] = [];
    for (let i = 0; i < nChunks; i++) {
      uploads.push(this.encryptAndUploadChunk(file, i, onChunkProgress(i)));
    }
    const results = await Promise.all(uploads);
    await setDoc(doc(fstore, "fileChunks", fileId), {
      chunks: results.map(({ id, key }) => ({ id, key })),
    });
  }

  async encryptAndUploadChunk(
    file: File,
    chunkNumber: number,
    onProgress: (loaded: number) => void
  ): Promise<BlobRef> {
    const chunk = file.slice(
      chunkNumber * CHUNK_SIZE,
      (chunkNumber + 1) * CHUNK_SIZE
    );
    const { plainTextKey, wrappedKey } = await generateWrappedKey(
      this.userAuth.fileKey
    );
    const encryptedChunk = await encrypt(
      await chunk.arrayBuffer(),
      plainTextKey
    );
    const blobId = await this.storageBackend.putBlob(
      encryptedChunk,
      onProgress
    );
    return {
      id: blobId,
      key: Buffer.from(wrappedKey).toString("base64"),
    };
  }

  async createFolder(
    name: string,
    parentFolderId: string | null
  ): Promise<Folder> {
    const id = uuid();
    const creationTime = new Date();
    const metadata: FolderMetadata = {
      name,
    };
    const folderDoc = doc(fstore, "folders", id);
    const encryptedMetadata = await encrypt(
      Buffer.from(JSON.stringify(metadata), "utf-8"),
      this.userAuth.metadataKey
    );
    await setDoc(folderDoc, {
      creationTime: creationTime.getTime(),
      metadata: Buffer.from(encryptedMetadata).toString("base64"),
      ownerId: this.ownerId,
      folderId: parentFolderId,
    });
    return {
      id,
      creationTime,
      folderId: parentFolderId,
      metadata,
      ownerId: this.ownerId,
      type: "folder",
    };
  }

  async getFoldersInFolder(folderId: string | null): Promise<Folder[]> {
    const folderCollection = collection(fstore, "folders");
    const q = query(
      folderCollection,
      where("ownerId", "==", this.ownerId),
      where("folderId", "==", folderId)
    );
    const results: Folder[] = [];
    for (const folder of (await getDocs(q)).docs) {
      const data = folder.data();
      const decryptedMetadata = await decrypt(
        Buffer.from(data.metadata, "base64"),
        this.userAuth.metadataKey
      );
      if (!decryptedMetadata) {
        throw new Error(`Unable to decrypt folder ${data.id}`);
      }
      const metadata = JSON.parse(
        Buffer.from(decryptedMetadata).toString("utf-8")
      );
      results.push({
        id: folder.id,
        creationTime: new Date(data.creationTime),
        folderId: data.folderId,
        ownerId: data.ownerId,
        metadata,
        type: "folder",
      } as Folder);
    }
    return results;
  }

  async getFilesInFolder(folderId: string | null): Promise<FileEntity[]> {
    const fileCollection = collection(fstore, "files");
    const q = query(
      fileCollection,
      where("ownerId", "==", this.ownerId),
      where("folderId", "==", folderId)
    );
    const results: FileEntity[] = [];
    for (const file of (await getDocs(q)).docs) {
      const data = file.data();
      const decryptedMetadata = await decrypt(
        Buffer.from(data.metadata, "base64"),
        this.userAuth.metadataKey
      );
      if (!decryptedMetadata) {
        throw new Error(`Unable to decrypt file ${data.id}`);
      }
      const metadata = JSON.parse(
        Buffer.from(decryptedMetadata).toString("utf-8")
      );
      results.push({
        id: file.id,
        creationTime: new Date(data.creationTime),
        folderId: data.folderId,
        hasThumbnail: data.hasThumbnail,
        ownerId: data.ownerId,
        metadata,
        type: "file",
      } as FileEntity);
    }
    return results;
  }

  async getFolderContents(folderId: string | null): Promise<FolderEntry[]> {
    const [folders, files] = await Promise.all([
      this.getFoldersInFolder(folderId),
      this.getFilesInFolder(folderId),
    ]);
    return [...folders, ...files];
  }

  async downloadFileToDisk(
    file: FileEntity,
    onProgress: (progress: number) => void
  ): Promise<void> {
    const fileChunksDoc = await getDoc(doc(fstore, "fileChunks", file.id));
    const chunks: BlobRef[] = fileChunksDoc.get("chunks");
    if (!chunks) {
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
      for (let i = 0; i < chunks.length; i++) {
        const chunkData = await this.downloadFileChunk(
          chunks[i],
          onChunkProgress(i)
        );
        await writer.write(new Uint8Array(chunkData));
      }
    } catch (e) {
      await writer.abort();
      throw e;
    }
    await writer.close();
  }

  async downloadFileChunk(
    chunk: BlobRef,
    onProgress: (loaded: number) => void
  ): Promise<ArrayBuffer> {
    const key = await unWrapKey(
      Buffer.from(chunk.key, "base64"),
      this.userAuth.fileKey
    );
    if (!key) {
      throw new Error("Unable to un-wrap file chunk key");
    }
    const encryptedChunkData = await this.storageBackend.getBlob(
      chunk.id,
      onProgress
    );
    const chunkData = await decrypt(encryptedChunkData, key);
    if (!chunkData) {
      throw new Error("Unable to decrypt file chunk");
    }
    return chunkData;
  }

  // Downloading files in-memory is only supported for files with one chunk.
  async downloadFileInMemory(fileId: string): Promise<ArrayBuffer | null> {
    const fileChunksDoc = await getDoc(doc(fstore, "fileChunks", fileId));
    const chunks: BlobRef[] = fileChunksDoc.get("chunks");
    if (!chunks) {
      throw new Error("Unable to find file chunks");
    }
    if (chunks.length > 1) {
      return null;
    }
    return await this.downloadFileChunk(chunks[0], () => undefined);
  }

  async deleteFile(fileId: string): Promise<void> {
    const fileChunksDoc = doc(fstore, "fileChunks", fileId);
    const chunks = (await getDoc(fileChunksDoc)).get("chunks");
    const operations = [];
    for (const chunk of chunks) {
      operations.push(this.storageBackend.deleteBlob(chunk.id));
    }
    operations.push(deleteDoc(fileChunksDoc));
    operations.push(deleteDoc(doc(fstore, "thumbnails", fileId)));
    await Promise.all(operations);
    await deleteDoc(doc(fstore, "files", fileId));
  }

  async deleteFolder(folderId: string): Promise<void> {
    const operations: Promise<void>[] = [];
    operations.push(deleteDoc(doc(fstore, "folders", folderId)));
    // Delete files and metadata of files inside the folder.
    const filesToDelete = await getDocs(
      query(
        collection(fstore, "files"),
        where("ownerId", "==", this.ownerId),
        where("folderId", "==", folderId)
      )
    );
    for (const file of filesToDelete.docs) {
      operations.push(this.deleteFile(file.id));
    }
    // Recursively delete folders inside folder.
    const foldersToDelete = await getDocs(
      query(
        collection(fstore, "folders"),
        where("ownerId", "==", this.ownerId),
        where("folderId", "==", folderId)
      )
    );
    for (const folder of foldersToDelete.docs) {
      operations.push(this.deleteFolder(folder.id));
    }
    await Promise.all(operations);
  }

  async moveFile(fileId: string, targetFolderId: string | null): Promise<void> {
    await updateDoc(doc(fstore, "files", fileId), {
      folderId: targetFolderId,
    });
  }

  async moveFolder(
    folderId: string,
    targetFolderId: string | null
  ): Promise<void> {
    await updateDoc(doc(fstore, "folders", folderId), {
      folderId: targetFolderId,
    });
  }
}
