import React, { createContext, useContext } from "react";
import type { FolderEntry } from "../database/model";

type FilesContext = {
  moveItems: (
    items: FolderEntry[],
    targetFolderId: string | null
  ) => Promise<void>;
};

const Context = createContext<FilesContext | undefined>(undefined);

export const useFiles = (): FilesContext => {
  const ctx = useContext(Context);
  if (ctx === undefined) {
    throw new Error("Context not found");
  }
  return ctx;
};

type FilesProviderProps = {
  children: React.ReactNode;
};

export const FilesProvider: React.FC<FilesProviderProps> = ({ children }) => {
  return (
    <Context.Provider
      value={{
        moveItems: async () => undefined,
      }}
    >
      {children}
    </Context.Provider>
  );
};
