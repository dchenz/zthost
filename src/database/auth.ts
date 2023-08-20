import { Buffer } from "buffer";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { fstore } from "../firebase";
import { deriveKey, generateWrappedKey, randomBytes } from "../utils/crypto";
import type { AuthProperties } from "./model";

export const getAuthPropertiesById = async (
  userId: string
): Promise<AuthProperties | null> => {
  const userDoc = await getDoc(doc(fstore, "userAuth", userId));
  const mainKey = userDoc.get("mainKey");
  if (!mainKey) {
    return null;
  }
  const salt = userDoc.get("salt");
  if (!salt) {
    return null;
  }
  return {
    mainKey: Buffer.from(mainKey, "base64"),
    salt: Buffer.from(salt, "base64"),
  };
};

export const createAuthProperties = async (
  userId: string,
  password: string
): Promise<ArrayBuffer> => {
  const userDoc = doc(fstore, "userAuth", userId);
  const salt = randomBytes(16);
  const { rawKey, wrappedKey } = await generateWrappedKey(
    deriveKey(Buffer.from(password, "utf-8"), salt)
  );
  await setDoc(userDoc, {
    mainKey: Buffer.from(wrappedKey).toString("base64"),
    salt: Buffer.from(salt).toString("base64"),
  });
  return rawKey;
};
