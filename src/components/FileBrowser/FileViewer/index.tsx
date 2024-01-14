import { Box } from "@chakra-ui/react";
import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useFiles } from "../../../context/files";
import { getViewMode } from "../../../redux/browserSlice";
import { useFolderContents } from "../../../redux/databaseApi";
import GridView from "./GridView";
import ListView from "./ListView";
import type { FolderEntry } from "../../../database/model";

const FileViewer: React.FC = () => {
  const { setPath, path, setPreviewFile, selectedItems, toggleSelectedItem } =
    useFiles();

  const viewMode = useSelector(getViewMode);

  const { data: items = [] } = useFolderContents(
    path[path.length - 1]?.id ?? null
  );

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
    <Box
      // Subtract navbar, toolbar and path viewer.
      height="calc(100vh - 48px - 48px - 40px)"
      // Push to the right to account for scrollbar.
      pr={3}
      overflowX="unset"
      overflowY="scroll"
    >
      <ListView items={sortedItems} onItemClick={onItemClick} />
    </Box>
  ) : (
    <Box
      // Subtract navbar, toolbar and path viewer.
      height="calc(100vh - 48px - 48px - 40px)"
      overflowY="scroll"
    >
      <GridView items={sortedItems} onItemClick={onItemClick} />
    </Box>
  );
};

export default FileViewer;
