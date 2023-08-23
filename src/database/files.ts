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
import { decrypt, encrypt } from "../utils/crypto";
import type { Folder, FolderEntry, FolderMetadata } from "./model";

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
