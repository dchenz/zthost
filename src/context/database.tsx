import React, { createContext, useCallback, useContext } from "react";
import { Buffer } from "buffer";
import {
  deriveKey,
  generateWrappedKey,
  randomBytes,
  wrapKey,
} from "../utils/crypto";
import type {
  AuthProperties,
  Database,
  UserAuthDocument,
} from "../database/model";

type DatabaseContextType = {
  createUserAuth: (
    userId: string,
    password: string,
    bucketId: string
  ) => Promise<AuthProperties>;
  database: Database;
  getUserAuth: (userId: string) => Promise<AuthProperties | null>;
  updatePassword: (
    userId: string,
    userAuth: AuthProperties,
    newPassword: string
  ) => Promise<void>;
};

const DatabaseContext = createContext<DatabaseContextType>({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  database: null,
});

export const useDatabase = () => {
  return useContext(DatabaseContext);
};

type DatabaseProviderProps = {
  children: React.ReactNode;
  database: Database;
};

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
  database,
}) => {
  const createUserAuth = useCallback(
    async (
      userId: string,
      password: string,
      bucketId: string
    ): Promise<AuthProperties> => {
      const salt = randomBytes(16);
      const passwordKey = deriveKey(Buffer.from(password, "utf-8"), salt);
      const fileKey = await generateWrappedKey(passwordKey);
      const metadataKey = await generateWrappedKey(passwordKey);
      const thumbnailKey = await generateWrappedKey(passwordKey);
      await database.createDocument("userAuth", userId, {
        fileKey: Buffer.from(fileKey.wrappedKey).toString("base64"),
        metadataKey: Buffer.from(metadataKey.wrappedKey).toString("base64"),
        thumbnailKey: Buffer.from(thumbnailKey.wrappedKey).toString("base64"),
        salt: Buffer.from(salt).toString("base64"),
        bucketId,
      });
      return {
        fileKey: fileKey.plainTextKey,
        metadataKey: metadataKey.plainTextKey,
        thumbnailKey: thumbnailKey.plainTextKey,
        salt,
        bucketId,
      };
    },
    [database]
  );

  const getUserAuth = useCallback(
    async (userId: string): Promise<AuthProperties | null> => {
      const userDoc = await database.getDocument<UserAuthDocument>(
        "userAuth",
        userId
      );
      if (!userDoc) {
        return null;
      }
      return {
        fileKey: Buffer.from(userDoc.fileKey, "base64"),
        metadataKey: Buffer.from(userDoc.metadataKey, "base64"),
        thumbnailKey: Buffer.from(userDoc.thumbnailKey, "base64"),
        salt: Buffer.from(userDoc.salt, "base64"),
        bucketId: userDoc.bucketId,
      };
    },
    [database]
  );

  const updatePassword = useCallback(
    async (
      userId: string,
      userAuth: AuthProperties,
      newPassword: string
    ): Promise<void> => {
      const newPasswordKey = deriveKey(
        Buffer.from(newPassword, "utf-8"),
        userAuth.salt
      );
      const fileKey = await wrapKey(userAuth.fileKey, newPasswordKey);
      const metadataKey = await wrapKey(userAuth.metadataKey, newPasswordKey);
      const thumbnailKey = await wrapKey(userAuth.thumbnailKey, newPasswordKey);
      await database.updateDocument<UserAuthDocument>("userAuth", userId, {
        fileKey: Buffer.from(fileKey).toString("base64"),
        metadataKey: Buffer.from(metadataKey).toString("base64"),
        thumbnailKey: Buffer.from(thumbnailKey).toString("base64"),
      });
    },
    [database]
  );

  return (
    <DatabaseContext.Provider
      value={{ createUserAuth, database, getUserAuth, updatePassword }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};
