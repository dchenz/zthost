import { Box } from "@chakra-ui/react";
import React from "react";
import { FilesProvider } from "../../context/files";
import FileViewer from "./FileViewer";
import Header from "./Header";
import PathViewer from "./PathViewer";
import PreviewModal from "./PreviewModal";
import TaskTracker from "./TaskTracker";

const FileBrowser: React.FC = () => {
  return (
    <FilesProvider>
      <Box position="relative">
        <Header />
        <PathViewer />
        <FileViewer />
        <TaskTracker />
        <PreviewModal />
      </Box>
    </FilesProvider>
  );
};

export default FileBrowser;
