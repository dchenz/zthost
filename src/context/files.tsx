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

type FilesContextType = {
  addItem: (item: FolderEntry) => void;
  isLoading: boolean;
  items: FolderEntry[];
  path: Folder[];
  setPath: (path: Folder[]) => void;
  setViewMode: (viewMode: ViewMode) => void;
  viewMode: ViewMode;
};

const FilesContext = createContext<FilesContextType>({
  addItem: () => undefined,
  isLoading: false,
  items: [],
  path: [],
  setPath: () => undefined,
  setViewMode: () => undefined,
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

  return (
    <FilesContext.Provider
      value={{
        addItem,
        isLoading,
        items,
        path,
        setPath,
        setViewMode,
        viewMode,
      }}
    >
      {children}
    </FilesContext.Provider>
  );
};
