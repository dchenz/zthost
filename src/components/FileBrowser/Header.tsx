import { Box, HStack } from "@chakra-ui/react";
import React, { useState } from "react";
import { Folder2 } from "react-bootstrap-icons";
import NewFolderModal from "./NewFolderModal";
import ResponsiveIconButton from "./ResponsiveIconButton";
import UploadButton from "./UploadButton";

const Header: React.FC = () => {
  const [isCreatingFolder, setCreatingFolder] = useState(false);

  return (
    <Box p={3}>
      <HStack gap={2} width="100%">
        <UploadButton />
        <ResponsiveIconButton
          ariaLabel="create-folder"
          icon={<Folder2 />}
          onClick={() => setCreatingFolder(true)}
          size="sm"
          text="New"
          title="Create folder"
        />
      </HStack>
      <NewFolderModal
        open={isCreatingFolder}
        onClose={() => setCreatingFolder(false)}
      />
    </Box>
  );
};

export default Header;
