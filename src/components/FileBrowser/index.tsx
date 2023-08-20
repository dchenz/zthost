import { Box } from "@chakra-ui/react";
import React from "react";
import { FilesProvider } from "../../context/files";
import AuthRequired from "../AuthRequired";
import FileViewer from "./FileViewer";
import Header from "./Header";
import PathViewer from "./PathViewer";

const FileBrowser: React.FC = () => {
  return (
    <AuthRequired>
      <FilesProvider>
        <Box minHeight="100vh">
          <Header />
          <PathViewer />
          <FileViewer />
        </Box>
      </FilesProvider>
    </AuthRequired>
  );
};

export default FileBrowser;
