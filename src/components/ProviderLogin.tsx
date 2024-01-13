import { Box, Heading, VStack } from "@chakra-ui/react";
import React from "react";
import ReactGoogleButton from "react-google-button";
import { useLogin } from "../redux/userSlice";

const ProviderLogin: React.FC = () => {
  const performLogin = useLogin();
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
