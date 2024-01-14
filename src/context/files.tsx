import React, { createContext, useCallback, useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectedItems } from "../redux/browserSlice";
import { useDatabase } from "./database";
import type { FileEntity, FolderEntry } from "../database/model";

type TaskType = "download" | "upload";

export type PendingTask = {
  id: string;
  // Need to mark an upload/download as ok because it
  // may still be pending when XHR reports 100% progress.
  ok?: boolean;
  progress: number;
  title: string;
  type: TaskType;
};

type FilesContext = {
  addDownloadTask: (file: FileEntity) => string;
  deleteItems: (items: FolderEntry[]) => Promise<void>;
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
  const [, setTasks] = useState<PendingTask[]>([]);

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const updateTask = useCallback(
    (id: string, updates: Partial<PendingTask>) => {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        )
      );
    },
    []
  );

  const addDownloadTask = useCallback((file: FileEntity) => {
    setTasks((currentTasks) => [
      ...currentTasks,
      {
        id: file.id,
        title: `Preparing to download '${file.metadata.name}'`,
        progress: 0,
        type: "download",
      },
    ]);
    database
      .downloadFileToDisk(file, (progress) => {
        updateTask(file.id, {
          progress,
          title: `Downloading '${file.metadata.name}'`,
        });
      })
      .then(() => {
        updateTask(file.id, {
          progress: 1,
          ok: true,
          title: file.metadata.name,
        });
      });
    return file.id;
  }, []);

  const deleteItems = useCallback(
    async (items: FolderEntry[]) => {
      const operations = [];
      for (const item of items) {
        if (item.type === "file") {
          operations.push(database.deleteFile(item.id));
        } else {
          operations.push(database.deleteFolder(item.id));
        }
      }
      await Promise.all(operations);
      for (const item of items) {
        removeItem(item.id);
      }
      dispatch(setSelectedItems([]));
    },
    [removeItem]
  );

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
        addDownloadTask,
        deleteItems,
        moveItems,
      }}
    >
      {children}
    </Context.Provider>
  );
};
