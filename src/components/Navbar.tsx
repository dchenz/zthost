import { Box, HStack } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../firebase";
import { getCurrentUser, setUserOnAuthStateChange } from "../redux/userSlice";
import UserMenu from "./UserMenu";
import type { AppDispatch } from "../store";

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector(getCurrentUser);

  useEffect(() => {
    return auth.onAuthStateChanged((firebaseUser) => {
      dispatch(setUserOnAuthStateChange(firebaseUser));
    });
  }, []);

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
