import { Box } from "@chakra-ui/react";
import React from "react";
import { FilesProvider } from "../../context/files";
import AuthRequired from "../AuthRequired";
import FileViewer from "./FileViewer";
import Header from "./Header";
import PathViewer from "./PathViewer";
import PreviewModal from "./PreviewModal";
import UploadsTracker from "./UploadsTracker";

const FileBrowser: React.FC = () => {
  return (
    <AuthRequired>
      <FilesProvider>
        <Box position="relative">
          <Header />
          <PathViewer />
          <FileViewer />
          <UploadsTracker />
          <PreviewModal />
        </Box>
      </FilesProvider>
    </AuthRequired>
  );
};

export default FileBrowser;
