import { Box, Heading, VStack } from "@chakra-ui/react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React from "react";
import ReactGoogleButton from "react-google-button";
import { auth } from "../firebase";

const Login: React.FC = () => {
  const onLoginClick = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <Box p={5}>
      <VStack gap={5}>
        <Heading size="md">Select a login method</Heading>
        <ReactGoogleButton onClick={onLoginClick} />
      </VStack>
    </Box>
  );
};

export default Login;
