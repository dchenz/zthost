import { Box } from "@chakra-ui/react";
import React from "react";
import Header from "./Header";

const FileBrowser: React.FC = () => {
  return (
    <Box minHeight="100vh" backgroundColor="#f5f5f5">
      <Header />
    </Box>
  );
};

export default FileBrowser;
