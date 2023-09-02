import {
  Box,
  CloseButton,
  Divider,
  IconButton,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { Download } from "react-bootstrap-icons";
import { useFiles } from "../../../context/files";
import { formatBinarySize } from "../../../utils";
import type { FileEntity } from "../../../database/model";

type FileDetailsProps = {
  file: FileEntity;
};

const FileDetails: React.FC<FileDetailsProps> = ({ file }) => {
  const { setPreviewFile, addDownloadTask } = useFiles();

  const handleDownload = async () => {
    setPreviewFile(null);
    addDownloadTask(file);
  };

  return (
    <VStack
      px={4}
      py={4}
      backgroundColor="#f5f5f5"
      width={{ md: "100%", lg: "300px" }}
      height={{ md: "auto", lg: "100%" }}
      alignItems="self-start"
    >
      <Box width="100%" display="flex">
        <CloseButton onClick={() => setPreviewFile(null)} />
        <Box flexGrow={1}></Box>
        <Tooltip label="Download">
          <IconButton
            icon={<Download />}
            aria-label="download"
            onClick={handleDownload}
            onFocus={(e) => e.preventDefault()}
            size="sm"
          />
        </Tooltip>
      </Box>
      <Text>{file.metadata.name}</Text>
      <Text fontSize="small" color="#777777">
        {file.creationTime.toLocaleString()}
      </Text>
      <Text fontSize="small" color="#777777">
        {formatBinarySize(file.metadata.size)}
      </Text>
      <Divider />
    </VStack>
  );
};

export default FileDetails;
