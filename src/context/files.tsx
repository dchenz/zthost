import React, { createContext, useCallback, useContext, useState } from "react";
import { v4 as uuid } from "uuid";
import { usePersistentState } from "../utils";
import { useDatabase } from "./database";
import type { FileEntity, Folder, FolderEntry } from "../database/model";

type ViewMode = "grid" | "list";

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
  addItem: (item: FolderEntry) => void;
  addUploadTask: (file: File) => string;
  deleteItems: (items: FolderEntry[]) => Promise<void>;
  moveItems: (
    items: FolderEntry[],
    targetFolderId: string | null
  ) => Promise<void>;
  path: Folder[];
  previewFile: FileEntity | null;
  removeDownloadTask: (id: string) => void;
  removeUploadTask: (id: string) => void;
  selectedItems: FolderEntry[];
  setPath: (path: Folder[]) => void;
  setPreviewFile: (selectedFile: FileEntity | null) => void;
  setSelectedItems: (items: FolderEntry[]) => void;
  setViewMode: (viewMode: ViewMode) => void;
  tasks: PendingTask[];
  toggleSelectedItem: (item: FolderEntry) => void;
  viewMode: ViewMode;
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
  const database = useDatabase();
  const [, setItems] = useState<FolderEntry[]>([]);
  const [path, setPath] = useState<Folder[]>([]);
  const [previewFile, setPreviewFile] = useState<FileEntity | null>(null);
  const [selectedItems, setSelectedItems] = useState<FolderEntry[]>([]);
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [viewMode, setViewMode] = usePersistentState<ViewMode>(
    "view-mode",
    "grid"
  );

  const addItem = useCallback((newItem: FolderEntry) => {
    setItems((currentItems) => [...currentItems, newItem]);
  }, []);

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

  const removeTask = useCallback((id: string) => {
    setTasks((currentTasks) => currentTasks.filter((u) => u.id !== id));
  }, []);

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

  const addUploadTask = useCallback(
    (file: File) => {
      const fileId = uuid();
      setTasks((currentTasks) => [
        ...currentTasks,
        {
          id: fileId,
          title: `Preparing to upload '${file.name}'`,
          progress: 0,
          type: "upload",
        },
      ]);
      database
        .createFileMetadata(fileId, file, path[path.length - 1]?.id ?? null)
        .then(async (f) => {
          updateTask(fileId, { title: `Uploading '${file.name}'` });
          await database.createFileChunks(fileId, file, (progress) => {
            updateTask(f.id, { progress });
          });
          updateTask(fileId, {
            progress: 1,
            ok: true,
            title: file.name,
          });
          addItem(f);
        });
      return fileId;
    },
    [path]
  );

  const toggleSelectedItem = useCallback((item: FolderEntry) => {
    setSelectedItems((currentItems) => {
      const newItems = currentItems.filter((f) => f.id !== item.id);
      if (newItems.length === currentItems.length) {
        newItems.push(item);
      }
      return newItems;
    });
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
      setSelectedItems([]);
    },
    [removeItem, setSelectedItems]
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
      setSelectedItems([]);
    },
    [removeItem, setSelectedItems]
  );

  return (
    <Context.Provider
      value={{
        addDownloadTask,
        addItem,
        addUploadTask,
        deleteItems,
        moveItems,
        path,
        previewFile,
        removeDownloadTask: removeTask,
        removeUploadTask: removeTask,
        selectedItems,
        setPath,
        setPreviewFile,
        setSelectedItems,
        setViewMode,
        tasks,
        toggleSelectedItem,
        viewMode,
      }}
    >
      {children}
    </Context.Provider>
  );
};
