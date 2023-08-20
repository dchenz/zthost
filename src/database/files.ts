import { Buffer } from "buffer";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { fstore } from "../firebase";
import { encrypt } from "../utils/crypto";

export const createFolder = async (
  name: string,
  ownerId: string,
  parentFolderId: string | null,
  encryptionKey: ArrayBuffer
): Promise<void> => {
  const folderDoc = doc(fstore, "folders", uuid());
  const encryptedFolderName = await encrypt(
    Buffer.from(name, "utf-8"),
    encryptionKey
  );
  await setDoc(folderDoc, {
    name: Buffer.from(encryptedFolderName).toString("base64"),
    ownerId,
    folderId: parentFolderId,
  });
};
