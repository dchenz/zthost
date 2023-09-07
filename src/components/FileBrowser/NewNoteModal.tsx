import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

type NewNoteModalProps = {
  onClose: () => void;
  open: boolean;
};

const NewNoteModal: React.FC<NewNoteModalProps> = ({ onClose, open }) => {
  const [noteContent, setNoteContent] = useState("");

  useEffect(() => {
    if (open) {
      setNoteContent("");
    }
  }, [open]);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  const confirmIfUnsavedChanges = () => {
    if (!noteContent || confirm("Your note will be discarded. Continue?")) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={confirmIfUnsavedChanges}
      size="2xl"
      isCentered
      blockScrollOnMount={false}
    >
      <ModalOverlay />
      <ModalContent as="form" onSubmit={onFormSubmit}>
        <ModalHeader>New note</ModalHeader>
        <ModalBody>
          <Textarea
            placeholder="Don't forget to save!"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={8}
            minHeight="100px"
            maxHeight="50vh"
          />
        </ModalBody>
        <ModalFooter>
          <Button type="submit" isDisabled={!noteContent}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NewNoteModal;
