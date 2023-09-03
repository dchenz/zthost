import {
  Alert,
  AlertIcon,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useSignedInUser } from "../context/user";
import { updatePassword } from "../database/auth";
import CreatePasswordForm from "./PasswordLogin/CreatePasswordForm";

type ChangePasswordModalProps = {
  onClose: () => void;
  open: boolean;
};

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  onClose,
  open,
}) => {
  const { user, fileHandler } = useSignedInUser();

  const onSubmit = async (password: string) => {
    await updatePassword(user.uid, fileHandler.userAuth, password);
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
      <ModalContent>
        <ModalHeader>Change password</ModalHeader>
        <ModalBody>
          <VStack gap={5} px={3} pb={5}>
            <Alert status="warning">
              <AlertIcon />
              <p>
                Do not refresh or navigate away from this page while the
                password is being updated.{" "}
                <strong>
                  It is recommended that you export your keys, so there is a
                  backup in case the update fails for whatever reason.
                </strong>
              </p>
            </Alert>
            {open ? <CreatePasswordForm onSubmit={onSubmit} /> : null}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ChangePasswordModal;
