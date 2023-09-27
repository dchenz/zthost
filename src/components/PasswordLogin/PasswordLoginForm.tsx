import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useCurrentUser } from "../../context/user";
import { decryptUserAuth } from "../../utils/crypto";
import type { AuthProperties } from "../../database/model";

type PasswordLoginFormProps = {
  encryptedUserAuth: AuthProperties;
  onAuthComplete: () => void;
};

const PasswordLoginForm: React.FC<PasswordLoginFormProps> = ({
  encryptedUserAuth,
  onAuthComplete,
}) => {
  const { setUserAuth } = useCurrentUser();
  const [password, setPassword] = useState("");
  const [loginFailed, setLoginFailed] = useState(false);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      return;
    }
    const userAuth = await decryptUserAuth(encryptedUserAuth, password);
    if (userAuth) {
      setUserAuth(userAuth);
      onAuthComplete();
    } else {
      setLoginFailed(true);
    }
  };

  return (
    <Box p={5}>
      <VStack gap={5}>
        <Heading size="md">Enter password</Heading>
        <form onSubmit={onFormSubmit} style={{ width: "400px" }}>
          <VStack gap={5}>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginFailed(false);
                }}
              />
            </FormControl>
            <Button
              colorScheme="teal"
              type="submit"
              variant="solid"
              isDisabled={!password}
              width="100%"
            >
              Submit
            </Button>
            {loginFailed ? (
              <Alert status="warning">
                <AlertIcon />
                Incorrect password
              </Alert>
            ) : null}
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default PasswordLoginForm;
