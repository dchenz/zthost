export const SCRYPT_PASSWORD_OPTIONS = {
  cpuCost: 2 ** 14,
  memoryCost: 8,
  nThreads: 1,
} as const;

export const MINIMUM_PASSWORD_LENGTH = 8;
export const THUMBNAIL_SIZE = 32;
export const CHUNK_SIZE = 1024 * 1024 * 64;
export const APP_BUCKET_NAME = "DO NOT DELETE - zthost:";

export const ROUTES = {
  index: "/",
  storage: "/storage",
  loginWithProvider: "/login",
  loginWithPassword: "/login/password",
} as const;
