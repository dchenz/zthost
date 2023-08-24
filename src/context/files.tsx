import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getFolderContents } from "../database/files";
import { usePersistentState } from "../utils";
import { useCurrentUser } from "./user";
import type { Folder, FolderEntry } from "../database/model";

type ViewMode = "grid" | "list";

type PendingUpload = {
  id: string;
  // Need to mark an upload as ok because requests
  // may still be pending when XHR reports 100% progress.
  ok?: boolean;
  progress: number;
  title: string;
};

type FilesContextType = {
  addItem: (item: FolderEntry) => void;
  addUpload: (id: string, title: string) => void;
  isLoading: boolean;
  items: FolderEntry[];
  path: Folder[];
  removeUpload: (id: string) => void;
  setPath: (path: Folder[]) => void;
  setUploadProgress: (id: string, progress: number, ok?: boolean) => void;
  setViewMode: (viewMode: ViewMode) => void;
  uploads: PendingUpload[];
  viewMode: ViewMode;
};

const FilesContext = createContext<FilesContextType>({
  addItem: () => undefined,
  addUpload: () => undefined,
  isLoading: false,
  items: [],
  path: [],
  removeUpload: () => undefined,
  setPath: () => undefined,
  setUploadProgress: () => undefined,
  setViewMode: () => undefined,
  uploads: [],
  viewMode: "grid",
});

export const useFiles = () => {
  return useContext(FilesContext);
};

type FilesProviderProps = {
  children: React.ReactNode;
};

export const FilesProvider: React.FC<FilesProviderProps> = ({ children }) => {
  const { user, encryptionKey } = useCurrentUser();
  const [items, setItems] = useState<FolderEntry[]>([]);
  const [path, setPath] = useState<Folder[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const [viewMode, setViewMode] = usePersistentState<ViewMode>(
    "view-mode",
    "grid"
  );

  useEffect(() => {
    if (user && encryptionKey) {
      setLoading(true);
      getFolderContents(
        user.uid,
        path[path.length - 1]?.id ?? null,
        encryptionKey
      )
        .then(setItems)
        .finally(() => setLoading(false));
    }
  }, [user, path]);

  const addItem = useCallback(
    (newItem: FolderEntry) => {
      setItems((currentItems) => [...currentItems, newItem]);
    },
    [setItems]
  );

  const addUpload = useCallback(
    (id: string, title: string) => {
      setUploads((currentUploads) => [
        ...currentUploads,
        {
          id,
          title,
          progress: 0,
        },
      ]);
    },
    [setUploads]
  );

  const removeUpload = useCallback(
    (id: string) => {
      setUploads((currentUploads) => currentUploads.filter((u) => u.id !== id));
    },
    [setUploads]
  );

  const setUploadProgress = useCallback(
    (id: string, progress: number, ok?: boolean) => {
      setUploads((currentUploads) =>
        currentUploads.map((u) => (u.id === id ? { ...u, progress, ok } : u))
      );
    },
    [setUploads]
  );

  return (
    <FilesContext.Provider
      value={{
        addItem,
        addUpload,
        isLoading,
        items,
        path,
        removeUpload,
        setPath,
        setUploadProgress,
        setViewMode,
        uploads,
        viewMode,
      }}
    >
      {children}
    </FilesContext.Provider>
  );
};
