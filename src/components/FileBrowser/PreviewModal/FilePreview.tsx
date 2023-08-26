import { Box } from "@chakra-ui/react";
import React from "react";
import type { FileEntity } from "../../../database/model";

type FilePreviewProps = {
  file: FileEntity;
};

const FilePreview: React.FC<FilePreviewProps> = () => {
  return <Box flexGrow={1} h="80vh" overflowY="scroll"></Box>;
};

export default FilePreview;
