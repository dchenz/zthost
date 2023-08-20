import { Box, Heading, VStack } from "@chakra-ui/react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React from "react";
import ReactGoogleButton from "react-google-button";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const onLoginClick = async () => {
    const provider = new GoogleAuthProvider();
    const response = await signInWithPopup(auth, provider);
    if (response.user) {
      navigate("/");
    }
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
