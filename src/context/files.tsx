import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePersistentState } from "../utils";
import { useSignedInUser } from "./user";
import type { FileEntity, Folder, FolderEntry } from "../database/model";

type ViewMode = "grid" | "list";

type TaskType = "download" | "upload";

type PendingTask = {
  id: string;
  // Need to mark an upload/download as ok because it
  // may still be pending when XHR reports 100% progress.
  ok?: boolean;
  progress: number;
  title: string;
  type: TaskType;
};

type FilesContextType = {
  addItem: (item: FolderEntry) => void;
  addTask: (type: TaskType, id: string, title: string) => void;
  isLoading: boolean;
  items: FolderEntry[];
  path: Folder[];
  previewFile: FileEntity | null;
  removeTask: (id: string) => void;
  setPath: (path: Folder[]) => void;
  setPreviewFile: (selectedFile: FileEntity | null) => void;
  setTaskProgress: (id: string, progress: number, ok?: boolean) => void;
  setViewMode: (viewMode: ViewMode) => void;
  tasks: PendingTask[];
  viewMode: ViewMode;
};

const FilesContext = createContext<FilesContextType>({
  addItem: () => undefined,
  addTask: () => undefined,
  isLoading: false,
  items: [],
  path: [],
  previewFile: null,
  removeTask: () => undefined,
  setPath: () => undefined,
  setPreviewFile: () => undefined,
  setTaskProgress: () => undefined,
  setViewMode: () => undefined,
  tasks: [],
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

  const addItem = useCallback(
    (newItem: FolderEntry) => {
      setItems((currentItems) => [...currentItems, newItem]);
    },
    [setItems]
  );

  const addTask = useCallback(
    (type: TaskType, id: string, title: string) => {
      setTasks((currentTasks) => [
        ...currentTasks,
        {
          id,
          title,
          progress: 0,
          type,
        },
      ]);
    },
    [setTasks]
  );

  const removeTask = useCallback(
    (id: string) => {
      setTasks((currentTasks) => currentTasks.filter((u) => u.id !== id));
    },
    [setTasks]
  );

  const setTaskProgress = useCallback(
    (id: string, progress: number, ok?: boolean) => {
      setTasks((currentTasks) =>
        currentTasks.map((u) => (u.id === id ? { ...u, progress, ok } : u))
      );
    },
    [setTasks]
  );

  return (
    <FilesContext.Provider
      value={{
        addItem,
        addTask,
        isLoading,
        items,
        path,
        previewFile,
        removeTask,
        setTaskProgress,
        setPath,
        setPreviewFile,
        setViewMode,
        tasks,
        viewMode,
      }}
    >
      {children}
    </FilesContext.Provider>
  );
};
