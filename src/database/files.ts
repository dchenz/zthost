import { doc, setDoc } from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { fstore } from "../firebase";

export const createFolder = async (name: string, ownerId: string, parentFolderId: string | null): Promise<void> => {
  const folderDoc = doc(fstore, "folders", uuid());
  await setDoc(folderDoc, {
    name,
    ownerId,
    folderId: parentFolderId
  });
};
