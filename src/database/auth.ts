import { doc, getDoc, setDoc } from "firebase/firestore";
import { Buffer } from "buffer";
import { fstore } from "../firebase";
import {
  decrypt,
  deriveKey,
  generateWrappedKey,
  randomBytes,
} from "../utils/crypto";
import type { AuthProperties } from "./model";

export const getUserAuth = async (
  userId: string
): Promise<AuthProperties | null> => {
  const userDoc = await getDoc(doc(fstore, "userAuth", userId));
  const fileKey = userDoc.get("fileKey");
  if (!fileKey) {
    return null;
  }

  const metadataKey = userDoc.get("metadataKey");
  if (!metadataKey) {
    return null;
  }

  const thumbnailKey = userDoc.get("thumbnailKey");
  if (!thumbnailKey) {
    return null;
  }

  const salt = userDoc.get("salt");
  if (!salt) {
    return null;
  }
  return {
    fileKey: Buffer.from(fileKey, "base64"),
    metadataKey: Buffer.from(metadataKey, "base64"),
    thumbnailKey: Buffer.from(thumbnailKey, "base64"),
    salt: Buffer.from(salt, "base64"),
    bucketId: userDoc.get("bucketId"),
  };
};

export const createUserAuth = async (
  userId: string,
  password: string,
  bucketId: string
): Promise<AuthProperties> => {
  const userDoc = doc(fstore, "userAuth", userId);
  const salt = randomBytes(16);
  const passwordKey = deriveKey(Buffer.from(password, "utf-8"), salt);
  const fileKey = await generateWrappedKey(passwordKey);
  const metadataKey = await generateWrappedKey(passwordKey);
  const thumbnailKey = await generateWrappedKey(passwordKey);
  await setDoc(userDoc, {
    fileKey: Buffer.from(fileKey.wrappedKey).toString("base64"),
    metadataKey: Buffer.from(metadataKey.wrappedKey).toString("base64"),
    thumbnailKey: Buffer.from(thumbnailKey.wrappedKey).toString("base64"),
    salt: Buffer.from(salt).toString("base64"),
    bucketId,
  });
  return {
    fileKey: fileKey.rawKey,
    metadataKey: metadataKey.rawKey,
    thumbnailKey: thumbnailKey.rawKey,
    salt,
    bucketId,
  };
};

export const decryptUserAuth = async (
  encryptedUserAuth: AuthProperties,
  password: string
): Promise<AuthProperties | null> => {
  const passwordKey = deriveKey(
    Buffer.from(password, "utf-8"),
    encryptedUserAuth.salt
  );
  const fileKey = await decrypt(
    Buffer.from(encryptedUserAuth.fileKey),
    passwordKey
  );
  if (!fileKey) {
    return null;
  }
  const metadataKey = await decrypt(
    Buffer.from(encryptedUserAuth.metadataKey),
    passwordKey
  );
  if (!metadataKey) {
    return null;
  }
  const thumbnailKey = await decrypt(
    Buffer.from(encryptedUserAuth.thumbnailKey),
    passwordKey
  );
  if (!thumbnailKey) {
    return null;
  }
  return {
    fileKey,
    metadataKey,
    thumbnailKey,
    salt: encryptedUserAuth.salt,
    bucketId: encryptedUserAuth.bucketId,
  };
};
