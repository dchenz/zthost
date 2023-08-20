import { Buffer } from "buffer";
import ScryptJS from "scrypt-js";

const options = {
  scrypt_cpu: 2 ** 14,
  scrypt_memory: 8,
  scrypt_threads: 1,
};

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
      options.scrypt_cpu,
      options.scrypt_memory,
      options.scrypt_threads,
      32
    )
  );
};

export const generateWrappedKey = async (
  key: ArrayBuffer
): Promise<{
  rawKey: ArrayBuffer;
  wrappedKey: ArrayBuffer;
}> => {
  const rawKey = randomBytes(32);
  const wrappedKey = await encrypt(rawKey, key);
  return {
    rawKey,
    wrappedKey,
  };
};

export const randomBytes = (n: number): ArrayBuffer => {
  return Buffer.from(window.crypto.getRandomValues(new Uint8Array(n)));
};
