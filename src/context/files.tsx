import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { v4 as uuid } from "uuid";
import { usePersistentState } from "../utils";
import { useSignedInUser } from "./user";
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

type FilesContextType = {
  addDownloadTask: (file: FileEntity) => string;
  addItem: (item: FolderEntry) => void;
  addUploadTask: (file: File) => string;
  isLoading: boolean;
  items: FolderEntry[];
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

const FilesContext = createContext<FilesContextType>({
  addDownloadTask: () => "",
  addItem: () => undefined,
  addUploadTask: () => "",
  isLoading: false,
  items: [],
  path: [],
  previewFile: null,
  removeDownloadTask: () => undefined,
  removeUploadTask: () => undefined,
  selectedItems: [],
  setPath: () => undefined,
  setPreviewFile: () => undefined,
  setSelectedItems: () => undefined,
  setViewMode: () => undefined,
  tasks: [],
  toggleSelectedItem: () => undefined,
  viewMode: "grid",
});

export const useFiles = () => {
  return useContext(FilesContext);
};

type FilesProviderProps = {
  children: React.ReactNode;
};

export const FilesProvider: React.FC<FilesProviderProps> = ({ children }) => {
  const { fileHandler } = useSignedInUser();
  const [items, setItems] = useState<FolderEntry[]>([]);
  const [path, setPath] = useState<Folder[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileEntity | null>(null);
  const [selectedItems, setSelectedItems] = useState<FolderEntry[]>([]);
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [viewMode, setViewMode] = usePersistentState<ViewMode>(
    "view-mode",
    "grid"
  );

  useEffect(() => {
    setLoading(true);
    fileHandler
      .getFolderContents(path[path.length - 1]?.id ?? null)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [fileHandler, path]);

  const addItem = useCallback((newItem: FolderEntry) => {
    setItems((currentItems) => [...currentItems, newItem]);
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
    fileHandler
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

  const addUploadTask = useCallback((file: File) => {
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
    fileHandler
      .uploadFileMetadata(fileId, file, path[path.length - 1]?.id ?? null)
      .then(async (f) => {
        updateTask(fileId, { title: `Uploading '${file.name}'` });
        await fileHandler.uploadFileChunks(fileId, file, (progress) => {
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
  }, []);

  const toggleSelectedItem = useCallback((item: FolderEntry) => {
    setSelectedItems((currentItems) => {
      const newItems = currentItems.filter((f) => f.id !== item.id);
      if (newItems.length === currentItems.length) {
        newItems.push(item);
      }
      return newItems;
    });
  }, []);

  return (
    <FilesContext.Provider
      value={{
        addDownloadTask,
        addItem,
        addUploadTask,
        isLoading,
        items,
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
    </FilesContext.Provider>
  );
};
