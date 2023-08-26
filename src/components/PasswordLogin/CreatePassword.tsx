import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useCurrentUser } from "../../context/user";
import { createUserAuth } from "../../database/auth";

type CreatePasswordProps = {
  onAuthComplete: () => void;
};

const CreatePassword: React.FC<CreatePasswordProps> = ({ onAuthComplete }) => {
  const { user, setUserAuth } = useCurrentUser();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!user) {
    return null;
  }

  const canSubmit = password.length > 8 && password === confirmPassword;

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }
    setUserAuth(await createUserAuth(user.uid, password));
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
        <form onSubmit={onFormSubmit} style={{ width: "400px" }}>
          <VStack gap={5}>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Confirm password</FormLabel>
              <Input
                type="password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormControl>
            <Button
              colorScheme="teal"
              type="submit"
              variant="solid"
              isDisabled={!canSubmit}
              width="100%"
            >
              Create
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default CreatePassword;
