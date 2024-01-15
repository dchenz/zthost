import React, { createContext, useCallback, useContext } from "react";
import {
  type Database,
  type FileEntity,
  type UserAuthDocument,
} from "../database/model";
import type { AppCollections } from "../database/model";

type DatabaseContext = {
  deleteFile: (fileId: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  downloadFileInMemory: (fileId: string) => Promise<ArrayBuffer | null>;
  downloadFileToDisk: (
    file: FileEntity,
    onProgress: (progress: number) => void
  ) => Promise<void>;
  moveFile: (fileId: string, targetFolderId: string | null) => Promise<void>;
  moveFolder: (
    folderId: string,
    targetFolderId: string | null
  ) => Promise<void>;
  updateUserAuth: (
    userId: string,
    userAuth: Partial<UserAuthDocument>
  ) => Promise<void>;
};

const Context = createContext<DatabaseContext | undefined>(undefined);

export const useDatabase = () => {
  const ctx = useContext(Context);
  if (ctx === undefined) {
    throw new Error("Context not found");
  }
  return ctx;
};

type DatabaseProviderProps = {
  children: React.ReactNode;
  database: Database<AppCollections>;
};

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
  database,
}) => {
  const updateUserAuth = useCallback(
    async (
      userId: string,
      userAuth: Partial<UserAuthDocument>
    ): Promise<void> => {
      await database.updateDocument("userAuth", userId, userAuth);
    },
    [database]
  );

  return (
    <Context.Provider
      value={{
        deleteFile: async () => undefined,
        deleteFolder: async () => undefined,
        downloadFileInMemory: async () => null,
        downloadFileToDisk: async () => undefined,
        moveFile: async () => undefined,
        moveFolder: async () => undefined,
        updateUserAuth,
      }}
    >
      {children}
    </Context.Provider>
  );
};
