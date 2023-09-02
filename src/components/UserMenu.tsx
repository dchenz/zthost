import {
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import React from "react";
import { useCurrentUser } from "../context/user";

const UserMenu: React.FC = () => {
  const { performLogout, user } = useCurrentUser();
  return (
    <Menu>
      <MenuButton as={Button} variant="unstyled">
        <Avatar size="sm" src={user?.photoURL ?? ""} />
      </MenuButton>
      <MenuList minW={0} w="150px" padding={0}>
        <MenuItem onClick={performLogout}>Logout</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default UserMenu;
