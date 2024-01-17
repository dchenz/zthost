import React, { createContext, useCallback, useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectedItems } from "../redux/browserSlice";
import { useDatabase } from "./database";
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
  const dispatch = useDispatch();

  const database = useDatabase();
  const [, setItems] = useState<FolderEntry[]>([]);

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const moveItems = useCallback(
    async (items: FolderEntry[], targetFolderId: string | null) => {
      for (const item of items) {
        if (item.type === "file") {
          await database.moveFile(item.id, targetFolderId);
        } else {
          await database.moveFolder(item.id, targetFolderId);
        }
        removeItem(item.id);
      }
      dispatch(setSelectedItems([]));
    },
    [removeItem]
  );

  return (
    <Context.Provider
      value={{
        moveItems,
      }}
    >
      {children}
    </Context.Provider>
  );
};
