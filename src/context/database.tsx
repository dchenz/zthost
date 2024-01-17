import React, { createContext, useContext } from "react";
import { type Database, type FileEntity } from "../database/model";
import type { AppCollections } from "../database/model";

type DatabaseContext = {
  downloadFileToDisk: (
    file: FileEntity,
    onProgress: (progress: number) => void
  ) => Promise<void>;
  moveFile: (fileId: string, targetFolderId: string | null) => Promise<void>;
  moveFolder: (
    folderId: string,
    targetFolderId: string | null
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
}) => {
  return (
    <Context.Provider
      value={{
        downloadFileToDisk: async () => undefined,
        moveFile: async () => undefined,
        moveFolder: async () => undefined,
      }}
    >
      {children}
    </Context.Provider>
  );
};
