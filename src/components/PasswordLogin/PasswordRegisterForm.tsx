import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { useCurrentUser } from "../../context/user";
import { createUserAuth } from "../../database/auth";
import CreatePasswordForm from "./CreatePasswordForm";

type PasswordRegisterFormProps = {
  onAuthComplete: () => void;
};

const PasswordRegisterForm: React.FC<PasswordRegisterFormProps> = ({
  onAuthComplete,
}) => {
  const { user, setUserAuth, storageBackend } = useCurrentUser();

  if (!user || !storageBackend) {
    return null;
  }

  const onSubmit = async (password: string) => {
    const bucketId = await storageBackend.initialize();
    setUserAuth(await createUserAuth(user.uid, password, bucketId));
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
