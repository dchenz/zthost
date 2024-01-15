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
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentUser,
  setStorageStrategy,
  setUserAuth,
} from "../../redux/userSlice";
import { decryptUserAuth } from "../../utils/crypto";
import type { UserAuthDocument } from "../../database/model";

type PasswordLoginFormProps = {
  encryptedUserAuth: UserAuthDocument;
  onAuthComplete: () => void;
};

const PasswordLoginForm: React.FC<PasswordLoginFormProps> = ({
  encryptedUserAuth,
  onAuthComplete,
}) => {
  const dispatch = useDispatch();
  const { storageStrategy } = useSelector(getCurrentUser);
  const [password, setPassword] = useState("");
  const [loginFailed, setLoginFailed] = useState(false);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !storageStrategy) {
      return;
    }
    const userAuth = await decryptUserAuth(encryptedUserAuth, password);
    if (userAuth) {
      dispatch(setUserAuth(userAuth));
      dispatch(
        setStorageStrategy({
          ...storageStrategy,
          rootFolderId: userAuth.bucketId,
        })
      );
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
