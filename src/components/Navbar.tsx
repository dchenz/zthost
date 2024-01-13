import { Box, HStack } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../firebase";
import { getCurrentUser, setUser } from "../redux/userSlice";
import UserMenu from "./UserMenu";

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(getCurrentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      dispatch(
        setUser({
          uid: user?.uid ?? "",
          photoURL: user?.photoURL ?? "",
        })
      );
    });
    return unsubscribe;
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
