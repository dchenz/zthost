import { Box, Heading, VStack } from "@chakra-ui/react";
import React, { useEffect } from "react";
import ReactGoogleButton from "react-google-button";
import { useDispatch } from "react-redux";
import { auth } from "../firebase";
import { setUserOnAuthStateChange, useLogin } from "../redux/userSlice";
import type { AppDispatch } from "../store";

const ProviderLogin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const performLogin = useLogin();

  useEffect(() => {
    return auth.onAuthStateChanged((firebaseUser) => {
      dispatch(setUserOnAuthStateChange(firebaseUser));
    });
  }, []);

  return (
    <Box p={5}>
      <VStack gap={5}>
        <Heading size="md">Select a login method</Heading>
        <ReactGoogleButton onClick={performLogin} />
      </VStack>
    </Box>
  );
};

export default ProviderLogin;
