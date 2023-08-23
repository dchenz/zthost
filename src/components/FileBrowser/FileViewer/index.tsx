import React, { useCallback } from "react";
import { useFiles } from "../../../context/files";
import GridView from "./GridView";
import ListView from "./ListView";
import type { FolderEntry } from "../../../database/model";

const FileViewer: React.FC = () => {
  const { viewMode, setPath, path, items } = useFiles();

  const onItemClick = useCallback(
    (item: FolderEntry) => {
      if (item.type === "folder") {
        setPath([...path, item]);
      }
    },
    [path]
  );

  return viewMode === "list" ? (
    <ListView items={items} onItemClick={onItemClick} />
  ) : (
    <GridView items={items} onItemClick={onItemClick} />
  );
};

export default FileViewer;
