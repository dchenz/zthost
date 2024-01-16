import { Box, HStack } from "@chakra-ui/react";
import React, { useState } from "react";
import { ArrowsMove, Folder2, Sticky, Trash } from "react-bootstrap-icons";
import { useDispatch, useSelector } from "react-redux";
import { useFiles } from "../../context/files";
import { getSelectedItems } from "../../redux/browserSlice";
import { deleteFIlesAndFolders } from "../../redux/database/api";
import ConfirmPopup from "../ConfirmPopup";
import MoveItemsModal from "./MoveItemsModal";
import NewFolderModal from "./NewFolderModal";
import NewNoteModal from "./NewNoteModal";
import ResponsiveIconButton from "./ResponsiveIconButton";
import UploadButton from "./UploadButton";
import ViewModeSelector from "./ViewModeSelector";
import type { AppDispatch } from "../../store";

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedItems = useSelector(getSelectedItems);
  const { moveItems } = useFiles();
  const [isCreatingFolder, setCreatingFolder] = useState(false);
  const [isMoving, setMoving] = useState(false);
  const [isCreatingNote, setCreatingNote] = useState(false);

  const deleteConfirmationPrompt = `Delete ${selectedItems.length} item${
    selectedItems.length > 1 ? "s" : ""
  }?`;

  return (
    <Box height="48px" px={3} py={2}>
      <HStack gap={2} width="100%">
        {selectedItems.length ? (
          <React.Fragment>
            <ConfirmPopup
              onConfirm={() => dispatch(deleteFIlesAndFolders(selectedItems))}
              prompt={deleteConfirmationPrompt}
            >
              <ResponsiveIconButton
                ariaLabel="delete-selected"
                icon={<Trash />}
                size="sm"
                text="Delete"
                title="Delete selected items"
                colorScheme="red"
              />
            </ConfirmPopup>
            <ResponsiveIconButton
              ariaLabel="move-selected"
              icon={<ArrowsMove />}
              size="sm"
              text="Move"
              title="Move selected items"
              onClick={() => setMoving(true)}
            />
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
            <ResponsiveIconButton
              ariaLabel="create-note"
              icon={<Sticky />}
              onClick={() => setCreatingNote(true)}
              size="sm"
              text="New"
              title="Create note"
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
      <MoveItemsModal
        itemsToMove={selectedItems}
        moveItems={moveItems}
        open={isMoving}
        onClose={() => setMoving(false)}
      />
      <NewNoteModal
        open={isCreatingNote}
        onClose={() => setCreatingNote(false)}
      />
    </Box>
  );
};

export default Header;
