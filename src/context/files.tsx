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

type PendingUpload = {
  id: string;
  // Need to mark an upload as ok because requests
  // may still be pending when XHR reports 100% progress.
  ok?: boolean;
  progress: number;
  title: string;
};

type FilesContextType = {
  addDownload: (id: string, title: string) => void;
  addItem: (item: FolderEntry) => void;
  addUpload: (id: string, title: string) => void;
  downloads: PendingUpload[];
  isLoading: boolean;
  items: FolderEntry[];
  path: Folder[];
  previewFile: FileEntity | null;
  removeDownload: (id: string) => void;
  removeUpload: (id: string) => void;
  setDownloadProgress: (id: string, progress: number, ok?: boolean) => void;
  setPath: (path: Folder[]) => void;
  setPreviewFile: (selectedFile: FileEntity | null) => void;
  setUploadProgress: (id: string, progress: number, ok?: boolean) => void;
  setViewMode: (viewMode: ViewMode) => void;
  uploads: PendingUpload[];
  viewMode: ViewMode;
};

const FilesContext = createContext<FilesContextType>({
  addDownload: () => undefined,
  addItem: () => undefined,
  addUpload: () => undefined,
  downloads: [],
  isLoading: false,
  items: [],
  path: [],
  previewFile: null,
  removeDownload: () => undefined,
  removeUpload: () => undefined,
  setDownloadProgress: () => undefined,
  setPath: () => undefined,
  setPreviewFile: () => undefined,
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
  const { fileHandler } = useSignedInUser();
  const [items, setItems] = useState<FolderEntry[]>([]);
  const [path, setPath] = useState<Folder[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileEntity | null>(null);
  const [downloads, setDownloads] = useState<PendingUpload[]>([]);
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
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

  const addDownload = useCallback(
    (id: string, title: string) => {
      setDownloads((currentDownloads) => [
        ...currentDownloads,
        {
          id,
          title,
          progress: 0,
        },
      ]);
    },
    [setDownloads]
  );

  const removeDownload = useCallback(
    (id: string) => {
      setDownloads((currentDownloads) =>
        currentDownloads.filter((u) => u.id !== id)
      );
    },
    [setDownloads]
  );

  const setDownloadProgress = useCallback(
    (id: string, progress: number, ok?: boolean) => {
      setDownloads((currentDownloads) =>
        currentDownloads.map((u) => (u.id === id ? { ...u, progress, ok } : u))
      );
    },
    [setDownloads]
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
        addDownload,
        addItem,
        addUpload,
        downloads,
        isLoading,
        items,
        path,
        previewFile,
        removeDownload,
        removeUpload,
        setDownloadProgress,
        setPath,
        setPreviewFile,
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
