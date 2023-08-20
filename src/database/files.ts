import { Buffer } from "buffer";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { fstore } from "../firebase";
import { decrypt, encrypt } from "../utils/crypto";
import type { Folder, FolderEntry } from "./model";

export const createFolder = async (
  name: string,
  ownerId: string,
  parentFolderId: string | null,
  encryptionKey: ArrayBuffer
): Promise<Folder> => {
  const id = uuid();
  const folderDoc = doc(fstore, "folders", id);
  const encryptedFolderName = await encrypt(
    Buffer.from(name, "utf-8"),
    encryptionKey
  );
  const folder = {
    name: Buffer.from(encryptedFolderName).toString("base64"),
    ownerId,
    folderId: parentFolderId,
  };
  await setDoc(folderDoc, folder);
  return { ...folder, type: "folder", id, name };
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
    const decryptedFolderName = await decrypt(
      Buffer.from(data.name, "base64"),
      encryptionKey
    );
    if (!decryptedFolderName) {
      throw new Error(`Unable to decrypt folder ${data.id}`);
    }
    results.push({
      ...data,
      name: Buffer.from(decryptedFolderName).toString("utf-8"),
      id: folder.id,
    } as Folder);
  }
  return results;
};
