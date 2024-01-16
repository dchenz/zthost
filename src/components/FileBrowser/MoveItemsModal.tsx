import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FilesProvider } from "../../context/files";
import { getPath, getSelectedItems, setPath } from "../../redux/browserSlice";
import { useFolderContents } from "../../redux/database/api";
import { folderContains } from "../../utils";
import ListView from "./FileViewer/ListView";
import PathViewer from "./PathViewer";
import type { FolderEntry } from "../../database/model";

type MoveItemsModalProps = {
  itemsToMove: FolderEntry[];
  moveItems: (
    items: FolderEntry[],
    targetFolderId: string | null
  ) => Promise<void>;
  onClose: () => void;
  open: boolean;
};

const _MoveItemsModal: React.FC<MoveItemsModalProps> = ({
  itemsToMove,
  moveItems,
  onClose,
}) => {
  const dispatch = useDispatch();
  const selectedItems = useSelector(getSelectedItems);
  const path = useSelector(getPath);

  const { data: items = [] } = useFolderContents(
    path[path.length - 1]?.id ?? null
  );

  // Users are only allowed to select one folder at a time.
  // If nothing is selected, it will move into the current folder.
  const moveTargetFolderId: string | null =
    selectedItems.length > 0
      ? selectedItems[0].id
      : path[path.length - 1]?.id ?? null;

  // Cannot move items into the same folder they're currently in.
  const canSubmit =
    itemsToMove.length > 0 && itemsToMove[0].folderId !== moveTargetFolderId;

  const onItemOpen = useCallback(
    (item: FolderEntry) => {
      if (item.type === "folder") {
        dispatch(setPath([...path, item]));
      }
    },
    [path]
  );

  const cannotMoveInto = useCallback(
    (folderToMoveInto: FolderEntry) => {
      // Non-folders are hidden from view.
      if (folderToMoveInto.type !== "folder") {
        return true;
      }
      // Cannot move a folder into itself or its subfolders.
      for (const itemToMove of itemsToMove) {
        if (
          itemToMove.type === "folder" &&
          folderContains(itemToMove, [...path, folderToMoveInto])
        ) {
          return true;
        }
      }
      return false;
    },
    [path, itemsToMove]
  );

  const onSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    await moveItems(itemsToMove, moveTargetFolderId);
    onClose();
  };

  return (
    <ModalContent>
      <ModalHeader>Move items</ModalHeader>
      <ModalBody>
        <PathViewer />
        <ListView
          allowMultiSelect={false}
          isDisabled={cannotMoveInto}
          items={items.filter((item) => item.type === "folder")}
          onItemClick={onItemOpen}
        />
      </ModalBody>
      <ModalFooter>
        <Button onClick={onSubmit} isDisabled={!canSubmit}>
          Move {selectedItems.length ? "into" : "here"}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
};

const MoveItemsModal: React.FC<MoveItemsModalProps> = (props) => {
  // Force the provider to be destroyed so it resets.
  return (
    <Modal
      isOpen={props.open}
      onClose={props.onClose}
      size="4xl"
      isCentered
      blockScrollOnMount={false}
    >
      <ModalOverlay />
      {props.open ? (
        <FilesProvider>
          <_MoveItemsModal {...props} />
        </FilesProvider>
      ) : null}
    </Modal>
  );
};

export default MoveItemsModal;
