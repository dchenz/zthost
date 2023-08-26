import { Box, HStack } from "@chakra-ui/react";
import React from "react";
import { useCurrentUser } from "../context/user";
import UserMenu from "./UserMenu";

const Navbar: React.FC = () => {
  const { user } = useCurrentUser();
  return (
    <HStack
      alignItems="center"
      backgroundColor="#2a4492"
      display="flex"
      width="100%"
      height="48px"
      p={3}
    >
      <Box color="#ffffff">zthost</Box>
      <Box flexGrow={1}></Box>
      {user ? <UserMenu /> : null}
    </HStack>
  );
};

export default Navbar;
