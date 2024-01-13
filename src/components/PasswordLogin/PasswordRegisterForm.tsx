import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Buffer } from "buffer";
import { useDatabase } from "../../context/database";
import { getSignedInUser, setUserAuth } from "../../redux/userSlice";
import { deriveKey, generateWrappedKey, randomBytes } from "../../utils/crypto";
import CreatePasswordForm from "./CreatePasswordForm";

type PasswordRegisterFormProps = {
  onAuthComplete: () => void;
};

const PasswordRegisterForm: React.FC<PasswordRegisterFormProps> = ({
  onAuthComplete,
}) => {
  const dispatch = useDispatch();
  const { user, storage } = useSelector(getSignedInUser);
  const { createUserAuth } = useDatabase();

  if (!user || !storage) {
    return null;
  }

  const onSubmit = async (password: string) => {
    const bucketId = await storage.initialize();
    const salt = randomBytes(16);
    const passwordKey = deriveKey(Buffer.from(password, "utf-8"), salt);
    const fileKey = await generateWrappedKey(passwordKey);
    const metadataKey = await generateWrappedKey(passwordKey);
    const thumbnailKey = await generateWrappedKey(passwordKey);
    await createUserAuth({
      id: user.uid,
      fileKey: Buffer.from(fileKey.wrappedKey).toString("base64"),
      metadataKey: Buffer.from(metadataKey.wrappedKey).toString("base64"),
      thumbnailKey: Buffer.from(thumbnailKey.wrappedKey).toString("base64"),
      salt: Buffer.from(salt).toString("base64"),
      bucketId,
    });
    dispatch(
      setUserAuth({
        fileKey: fileKey.plainTextKey,
        metadataKey: metadataKey.plainTextKey,
        thumbnailKey: thumbnailKey.plainTextKey,
        salt,
        bucketId,
      })
    );
    onAuthComplete();
  };

  return (
    <Box p={5}>
      <VStack gap={5}>
        <Heading size="md">Create a password</Heading>
        <Text>
          This will be used to encrypt/decrypt all your data. Don&apos;t forget
          it!
        </Text>
        <CreatePasswordForm onSubmit={onSubmit} />
      </VStack>
    </Box>
  );
};

export default PasswordRegisterForm;
