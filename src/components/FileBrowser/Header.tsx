import { Box, HStack } from "@chakra-ui/react";
import React, { useState } from "react";
import { Folder2, Trash } from "react-bootstrap-icons";
import { useFiles } from "../../context/files";
import { useSignedInUser } from "../../context/user";
import ConfirmPopup from "../ConfirmPopup";
import NewFolderModal from "./NewFolderModal";
import ResponsiveIconButton from "./ResponsiveIconButton";
import UploadButton from "./UploadButton";
import ViewModeSelector from "./ViewModeSelector";

const Header: React.FC = () => {
  const { fileHandler } = useSignedInUser();
  const { selectedItems, removeItem, setSelectedItems } = useFiles();
  const [isCreatingFolder, setCreatingFolder] = useState(false);

  const onDelete = async () => {
    const operations = [];
    for (const item of selectedItems) {
      if (item.type === "file") {
        operations.push(fileHandler.deleteFile(item.id));
      }
    }
    await Promise.all(operations);
    for (const item of selectedItems) {
      removeItem(item.id);
    }
    setSelectedItems([]);
  };

  return (
    <Box height="48px" px={3} py={2}>
      <HStack gap={2} width="100%">
        {selectedItems.length ? (
          <React.Fragment>
            <ConfirmPopup onConfirm={onDelete} prompt="Delete selected files?">
              <ResponsiveIconButton
                ariaLabel="delete-selected"
                icon={<Trash />}
                size="sm"
                text="Delete"
                title="Delete selected items"
              />
            </ConfirmPopup>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <UploadButton />
            <ResponsiveIconButton
              ariaLabel="create-folder"
              icon={<Folder2 />}
              onClick={() => setCreatingFolder(true)}
              size="sm"
              text="New"
              title="Create folder"
            />
          </React.Fragment>
        )}
        <Box flexGrow={1}></Box>
        <ViewModeSelector />
      </HStack>
      <NewFolderModal
        open={isCreatingFolder}
        onClose={() => setCreatingFolder(false)}
      />
    </Box>
  );
};

export default Header;
