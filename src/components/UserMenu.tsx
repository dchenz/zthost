import {
  Avatar,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { GIT_COMMIT_HASH } from "../config";
import { useFirebaseAuth } from "../context/firebaseAuth";
import { useCurrentUser } from "../context/user";
import ChangePasswordModal from "./ChangePasswordModal";

const UserMenu: React.FC = () => {
  const { user, userAuth } = useCurrentUser();
  const { performLogout } = useFirebaseAuth();
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
        {GIT_COMMIT_HASH ? (
          <Box px={3} py={1} color="grey">
            version: {GIT_COMMIT_HASH}
          </Box>
        ) : null}
      </MenuList>
    </Menu>
  );
};

export default UserMenu;
