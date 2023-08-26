import React, { useCallback, useMemo } from "react";
import { useFiles } from "../../../context/files";
import GridView from "./GridView";
import ListView from "./ListView";
import type { FolderEntry } from "../../../database/model";

const FileViewer: React.FC = () => {
  const {
    viewMode,
    setPath,
    path,
    items,
    setPreviewFile,
    selectedItems,
    toggleSelectedItem,
  } = useFiles();

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        // The default sort shows folders first, then files.
        // Within each type, sort them by most recent first.
        if (a.type === "file" && b.type === "folder") {
          return 1;
        }
        if (a.type === "folder" && b.type === "file") {
          return -1;
        }
        return b.creationTime.getTime() - a.creationTime.getTime();
      }),
    [items]
  );

  const onItemClick = useCallback(
    (item: FolderEntry) => {
      if (selectedItems.length) {
        toggleSelectedItem(item);
      } else if (item.type === "folder") {
        setPath([...path, item]);
      } else {
        setPreviewFile(item);
      }
    },
    [path, selectedItems]
  );

  return viewMode === "list" ? (
    <ListView items={sortedItems} onItemClick={onItemClick} />
  ) : (
    <GridView items={sortedItems} onItemClick={onItemClick} />
  );
};

export default FileViewer;
