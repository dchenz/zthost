import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { Buffer } from "buffer";
import { fstore } from "../firebase";
import { decrypt, encrypt, generateWrappedKey } from "../utils/crypto";
import type {
  BlobRef,
  FileEntity,
  FileMetadata,
  Folder,
  FolderEntry,
  FolderMetadata,
} from "./model";
import type { BlobStorage } from "../blobstorage/model";

export class FileHandler {
  chunkSize = 1024 * 1024 * 64;
  storageBackend: BlobStorage;
  key: ArrayBuffer;

  constructor(storageBackend: BlobStorage, key: ArrayBuffer) {
    this.storageBackend = storageBackend;
    this.key = key;
  }

  async uploadFile(
    file: File,
    parentFolderId: string,
    userId: string,
    onUploadStart: (id: string) => void,
    onUploadProgress: (id: string, progress: number) => void,
    onUploadFinish: (id: string) => void
  ): Promise<FileEntity> {
    const fileId = uuid();
    const creationTime = new Date();
    const metadata: FileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
    };
    const encryptedMetadata = await encrypt(
      Buffer.from(JSON.stringify(metadata), "utf-8"),
      this.key
    );
    await setDoc(doc(fstore, "files", fileId), {
      creationTime: creationTime.getTime(),
      folderId: parentFolderId,
      metadata: Buffer.from(encryptedMetadata).toString("base64"),
      ownerId: userId,
    });
    // Aggregate the upload progress across all chunks and pass it to the
    // callback to report overall upload progress.
    const uploadProgress: Record<number, [number, number]> = {};
    const onChunkProgress =
      (chunkNumber: number) => (loaded: number, total: number) => {
        if (chunkNumber in uploadProgress) {
          uploadProgress[chunkNumber][0] = loaded;
        } else {
          uploadProgress[chunkNumber] = [loaded, total];
        }
        // Total chunk size may be different to the actual file size
        // due to extra metadata added during encryption.
        let loadedAllChunks = 0;
        let totalAllChunks = 0;
        for (const progress of Object.values(uploadProgress)) {
          loadedAllChunks += progress[0];
          totalAllChunks += progress[1];
        }
        onUploadProgress(fileId, loadedAllChunks / totalAllChunks);
      };
    onUploadStart(fileId);
    const nChunks = Math.ceil(file.size / this.chunkSize);
    const uploads: Promise<BlobRef>[] = [];
    for (let i = 0; i < nChunks; i++) {
      uploads.push(this.uploadFileChunk(file, i, onChunkProgress(i)));
    }
    const results = await Promise.all(uploads);
    await setDoc(doc(fstore, "fileChunks", fileId), {
      chunks: results.map(({ id, key }) => ({ id, key })),
    });
    onUploadFinish(fileId);
    return {
      id: fileId,
      creationTime,
      folderId: parentFolderId,
      metadata,
      ownerId: userId,
      type: "file",
    };
  }

  async uploadFileChunk(
    file: File,
    chunkNumber: number,
    onProgress: (loaded: number, total: number) => void
  ): Promise<BlobRef> {
    const chunk = file.slice(
      chunkNumber * this.chunkSize,
      (chunkNumber + 1) * this.chunkSize
    );
    const { rawKey, wrappedKey } = await generateWrappedKey(this.key);
    const encryptedChunk = await encrypt(await chunk.arrayBuffer(), rawKey);
    const blobId = await this.storageBackend.putBlob(
      await new Response(encryptedChunk).blob(),
      onProgress
    );
    return {
      id: blobId,
      key: Buffer.from(wrappedKey).toString("base64"),
    };
  }

  async createFolder(
    name: string,
    ownerId: string,
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
      this.key
    );
    await setDoc(folderDoc, {
      creationTime: creationTime.getTime(),
      metadata: Buffer.from(encryptedMetadata).toString("base64"),
      ownerId,
      folderId: parentFolderId,
    });
    return {
      id,
      creationTime,
      folderId: parentFolderId,
      metadata,
      ownerId,
      type: "folder",
    };
  }

  async getFoldersInFolder(
    ownerId: string,
    folderId: string | null
  ): Promise<Folder[]> {
    const folderCollection = collection(fstore, "folders");
    const q = query(
      folderCollection,
      where("ownerId", "==", ownerId),
      where("folderId", "==", folderId)
    );
    const results: Folder[] = [];
    for (const folder of (await getDocs(q)).docs) {
      const data = folder.data();
      const decryptedMetadata = await decrypt(
        Buffer.from(data.metadata, "base64"),
        this.key
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

  async getFilesInFolder(
    ownerId: string,
    folderId: string | null
  ): Promise<FileEntity[]> {
    const fileCollection = collection(fstore, "files");
    const q = query(
      fileCollection,
      where("ownerId", "==", ownerId),
      where("folderId", "==", folderId)
    );
    const results: FileEntity[] = [];
    for (const file of (await getDocs(q)).docs) {
      const data = file.data();
      const decryptedMetadata = await decrypt(
        Buffer.from(data.metadata, "base64"),
        this.key
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
        ownerId: data.ownerId,
        metadata,
        type: "file",
      } as FileEntity);
    }
    return results;
  }

  async getFolderContents(
    ownerId: string,
    folderId: string | null
  ): Promise<FolderEntry[]> {
    const [folders, files] = await Promise.all([
      this.getFoldersInFolder(ownerId, folderId),
      this.getFilesInFolder(ownerId, folderId),
    ]);
    return [...folders, ...files];
  }
}
