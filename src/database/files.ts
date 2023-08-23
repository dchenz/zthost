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

export const createFolder = async (
  name: string,
  ownerId: string,
  parentFolderId: string | null,
  encryptionKey: ArrayBuffer
): Promise<Folder> => {
  const id = uuid();
  const metadata: FolderMetadata = {
    name,
  };
  const folderDoc = doc(fstore, "folders", id);
  const encryptedMetadata = await encrypt(
    Buffer.from(JSON.stringify(metadata), "utf-8"),
    encryptionKey
  );
  const folder = {
    metadata: Buffer.from(encryptedMetadata).toString("base64"),
    ownerId,
    folderId: parentFolderId,
  };
  await setDoc(folderDoc, folder);
  return { ...folder, type: "folder", id, metadata };
};

export const getFolderContents = async (
  ownerId: string,
  folderId: string | null,
  encryptionKey: ArrayBuffer
): Promise<FolderEntry[]> => {
  const folderCollection = collection(fstore, "folders");
  const q = query(
    folderCollection,
    where("ownerId", "==", ownerId),
    where("folderId", "==", folderId)
  );
  const results: FolderEntry[] = [];
  for (const folder of (await getDocs(q)).docs) {
    const data = folder.data();
    const decryptedMetadata = await decrypt(
      Buffer.from(data.metadata, "base64"),
      encryptionKey
    );
    if (!decryptedMetadata) {
      throw new Error(`Unable to decrypt folder ${data.id}`);
    }
    const metadata = JSON.parse(
      Buffer.from(decryptedMetadata).toString("utf-8")
    );
    results.push({
      ...data,
      metadata,
      id: folder.id,
      type: "folder",
    } as Folder);
  }
  return results;
};

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
    userId: string
  ): Promise<FileEntity> {
    const fileId = uuid();
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
      folderId: parentFolderId,
      metadata: Buffer.from(encryptedMetadata).toString("base64"),
      ownerId: userId,
    });
    const nChunks = Math.ceil(file.size / this.chunkSize);
    const uploads: Promise<BlobRef>[] = [];
    for (let i = 0; i < nChunks; i++) {
      uploads.push(this.uploadFileChunk(file, i));
    }
    const results = await Promise.all(uploads);
    await setDoc(doc(fstore, "fileChunks", fileId), {
      chunks: results.map(({ id, key }) => ({ id, key })),
    });
    return {
      id: fileId,
      folderId: parentFolderId,
      metadata,
      ownerId: userId,
      type: "file",
    };
  }

  async uploadFileChunk(file: File, chunkNumber: number): Promise<BlobRef> {
    const chunk = file.slice(
      chunkNumber * this.chunkSize,
      (chunkNumber + 1) * this.chunkSize
    );
    const { rawKey, wrappedKey } = await generateWrappedKey(this.key);
    const encryptedChunk = await encrypt(await chunk.arrayBuffer(), rawKey);
    const blobId = await this.storageBackend.putBlob(
      await new Response(encryptedChunk).blob()
    );
    return {
      id: blobId,
      key: Buffer.from(wrappedKey).toString("base64"),
    };
  }
}
