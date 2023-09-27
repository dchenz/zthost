import ScryptJS from "scrypt-js";
import { Buffer } from "buffer";
import { SCRYPT_PASSWORD_OPTIONS } from "../config";
import type { AuthProperties } from "../database/model";

const concatArrayBuffer = (...buffers: ArrayBuffer[]): ArrayBuffer => {
  const totalByteLength = buffers.reduce(
    (prev, cur) => prev + cur.byteLength,
    0
  );
  const tmp = new Uint8Array(totalByteLength);
  let curOffset = 0;
  for (const buf of buffers) {
    tmp.set(new Uint8Array(buf), curOffset);
    curOffset += buf.byteLength;
  }
  return tmp.buffer;
};

export const encrypt = async (
  plain: ArrayBuffer,
  key: ArrayBuffer
): Promise<ArrayBuffer> => {
  const iv = randomBytes(12);
  const cipher = { name: "AES-GCM", iv };
  const _key = await window.crypto.subtle.importKey(
    "raw",
    key,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  return concatArrayBuffer(
    iv,
    await window.crypto.subtle.encrypt(cipher, _key, plain)
  );
};

export const decrypt = async (
  enc: ArrayBuffer,
  key: ArrayBuffer
): Promise<ArrayBuffer | null> => {
  const cipher = { name: "AES-GCM", iv: enc.slice(0, 12) };
  const _key = await window.crypto.subtle.importKey(
    "raw",
    key,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  try {
    return await window.crypto.subtle.decrypt(cipher, _key, enc.slice(12));
  } catch (e) {
    return null;
  }
};

export const deriveKey = (
  password: ArrayBuffer,
  salt: ArrayBuffer
): ArrayBuffer => {
  return Buffer.from(
    ScryptJS.syncScrypt(
      Buffer.from(password),
      Buffer.from(salt),
      SCRYPT_PASSWORD_OPTIONS.cpuCost,
      SCRYPT_PASSWORD_OPTIONS.memoryCost,
      SCRYPT_PASSWORD_OPTIONS.nThreads,
      32
    )
  );
};

export const generateWrappedKey = async (
  key: ArrayBuffer
): Promise<{
  plainTextKey: ArrayBuffer;
  wrappedKey: ArrayBuffer;
}> => {
  const plainTextKey = randomBytes(32);
  const wrappedKey = await wrapKey(plainTextKey, key);
  return {
    plainTextKey,
    wrappedKey,
  };
};

export const randomBytes = (n: number): ArrayBuffer => {
  return Buffer.from(window.crypto.getRandomValues(new Uint8Array(n)));
};

export const wrapKey = async (
  plainTextKey: ArrayBuffer,
  key: ArrayBuffer
): Promise<ArrayBuffer> => {
  return await encrypt(plainTextKey, key);
};

export const unWrapKey = async (
  wrappedKey: ArrayBuffer,
  key: ArrayBuffer
): Promise<ArrayBuffer | null> => {
  return await decrypt(wrappedKey, key);
};

export const decryptUserAuth = async (
  encryptedUserAuth: AuthProperties,
  password: string
): Promise<AuthProperties | null> => {
  const passwordKey = deriveKey(
    Buffer.from(password, "utf-8"),
    encryptedUserAuth.salt
  );
  const fileKey = await unWrapKey(
    Buffer.from(encryptedUserAuth.fileKey),
    passwordKey
  );
  if (!fileKey) {
    return null;
  }
  const metadataKey = await unWrapKey(
    Buffer.from(encryptedUserAuth.metadataKey),
    passwordKey
  );
  if (!metadataKey) {
    return null;
  }
  const thumbnailKey = await unWrapKey(
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
