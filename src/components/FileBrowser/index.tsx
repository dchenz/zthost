import { Box } from "@chakra-ui/react";
import React from "react";
import { FilesProvider } from "../../context/files";
import AuthRequired from "../AuthRequired";
import GridView from "./GridView";
import Header from "./Header";
import PathViewer from "./PathViewer";

const FileBrowser: React.FC = () => {
  return (
    <AuthRequired>
      <FilesProvider>
        <Box minHeight="100vh">
          <Header />
          <PathViewer />
          <GridView />
        </Box>
      </FilesProvider>
    </AuthRequired>
  );
};

export default FileBrowser;
