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
import { useCurrentUser } from "../../context/user";
import { createFolder } from "../../database/files";

type NewFolderModalProps = {
  onClose: () => void;
  open: boolean;
};

const NewFolderModal: React.FC<NewFolderModalProps> = ({ onClose, open }) => {
  const { user, encryptionKey } = useCurrentUser();
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
    }
  }, [open]);

  if (!user || !encryptionKey) {
    return null;
  }

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      return;
    }
    await createFolder(name, user.uid, null, encryptionKey);
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
