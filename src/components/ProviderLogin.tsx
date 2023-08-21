import { Box, Heading, VStack } from "@chakra-ui/react";
import React from "react";
import ReactGoogleButton from "react-google-button";
import { useCurrentUser } from "../context/user";

const ProviderLogin: React.FC = () => {
  const { performLogin } = useCurrentUser();
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
