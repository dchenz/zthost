import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useFiles } from "../../context/files";
import { useSignedInUser } from "../../context/user";

type NewFolderModalProps = {
  onClose: () => void;
  open: boolean;
};

const NewFolderModal: React.FC<NewFolderModalProps> = ({ onClose, open }) => {
  const { user, fileHandler } = useSignedInUser();
  const { addItem, path } = useFiles();
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
    }
  }, [open]);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      return;
    }
    const newFolder = await fileHandler.createFolder(
      name,
      user.uid,
      path[path.length - 1]?.id ?? null
    );
    addItem(newFolder);
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={onFormSubmit}>
        <ModalHeader>New folder</ModalHeader>
        <ModalBody>
          <Input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button type="submit" disabled={!name}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NewFolderModal;
