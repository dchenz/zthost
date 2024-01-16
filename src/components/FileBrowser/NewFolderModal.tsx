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
import { useSelector } from "react-redux";
import { getPath } from "../../redux/browserSlice";
import { useCreateFolderMutation } from "../../redux/database/api";

type NewFolderModalProps = {
  onClose: () => void;
  open: boolean;
};

const NewFolderModal: React.FC<NewFolderModalProps> = ({ onClose, open }) => {
  const [createFolder] = useCreateFolderMutation();
  const path = useSelector(getPath);
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
    await createFolder({
      name,
      parentFolderId: path[path.length - 1]?.id ?? null,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="2xl"
      isCentered
      blockScrollOnMount={false}
    >
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
          <Button type="submit" isDisabled={!name}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NewFolderModal;
