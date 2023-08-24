import { Box, HStack } from "@chakra-ui/react";
import React, { useState } from "react";
import { Folder2 } from "react-bootstrap-icons";
import NewFolderModal from "./NewFolderModal";
import ResponsiveIconButton from "./ResponsiveIconButton";
import UploadButton from "./UploadButton";
import ViewModeSelector from "./ViewModeSelector";

const Header: React.FC = () => {
  const [isCreatingFolder, setCreatingFolder] = useState(false);
  return (
    <Box height="48px" px={3} py={2}>
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
        <Box flexGrow={1}></Box>
        <ViewModeSelector />
      </HStack>
      <NewFolderModal
        open={isCreatingFolder}
        onClose={() => setCreatingFolder(false)}
      />
    </Box>
  );
};

export default Header;
