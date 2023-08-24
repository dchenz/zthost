import { Box, HStack } from "@chakra-ui/react";
import React from "react";

const Navbar: React.FC = () => {
  return (
    <HStack backgroundColor="#2a4492" width="100%" height="48px" p={3}>
      <Box color="#ffffff">zthost</Box>
    </HStack>
  );
};

export default Navbar;
