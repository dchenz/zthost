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
import { useSelector } from "react-redux";
import { Buffer } from "buffer";
import { useDatabase } from "../context/database";
import { getCurrentUser } from "../redux/userSlice";
import { deriveKey, wrapKey } from "../utils/crypto";
import CreatePasswordForm from "./PasswordLogin/CreatePasswordForm";

type ChangePasswordModalProps = {
  onClose: () => void;
  open: boolean;
};

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  onClose,
  open,
}) => {
  const { user, userAuth } = useSelector(getCurrentUser);
  const { updateUserAuth } = useDatabase();

  const onSubmit = async (newPassword: string) => {
    if (!user || !userAuth) {
      return;
    }
    const newPasswordKey = deriveKey(
      Buffer.from(newPassword, "utf-8"),
      userAuth.salt
    );
    const fileKey = await wrapKey(userAuth.fileKey, newPasswordKey);
    const metadataKey = await wrapKey(userAuth.metadataKey, newPasswordKey);
    const thumbnailKey = await wrapKey(userAuth.thumbnailKey, newPasswordKey);
    await updateUserAuth(user.uid, {
      fileKey: Buffer.from(fileKey).toString("base64"),
      metadataKey: Buffer.from(metadataKey).toString("base64"),
      thumbnailKey: Buffer.from(thumbnailKey).toString("base64"),
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
