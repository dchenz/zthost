import {
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getCurrentUser, useLogout } from "../redux/userSlice";
import ChangePasswordModal from "./ChangePasswordModal";

const UserMenu: React.FC = () => {
  const { user, userAuth } = useSelector(getCurrentUser);
  const performLogout = useLogout();
  const [isChangingPassword, setChangingPassword] = useState(false);
  return (
    <Menu>
      <MenuButton as={Button} variant="unstyled">
        <Avatar size="sm" src={user?.photoURL ?? ""} />
        <ChangePasswordModal
          open={isChangingPassword}
          onClose={() => setChangingPassword(false)}
        />
      </MenuButton>
      <MenuList minW={0} w="200px" padding={0} zIndex={999}>
        {userAuth ? (
          <MenuItem onClick={() => setChangingPassword(true)}>
            Change password
          </MenuItem>
        ) : null}
        <MenuItem onClick={performLogout}>Logout</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default UserMenu;
