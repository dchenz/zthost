import {
  Box,
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
      py={8}
      backgroundColor="#f5f5f5"
      width={{ md: "100%", lg: "300px" }}
      alignItems="self-start"
    >
      <Text>{file.metadata.name}</Text>
      <Text fontSize="small" color="#777777">
        {file.creationTime.toLocaleString()}
      </Text>
      <Text fontSize="small" color="#777777">
        {formatBinarySize(file.metadata.size)}
      </Text>
      <Divider />
      <Box>
        <Tooltip label="Download">
          <IconButton
            icon={<Download />}
            aria-label="download"
            onClick={handleDownload}
            onFocus={(e) => e.preventDefault()}
          />
        </Tooltip>
      </Box>
    </VStack>
  );
};

export default FileDetails;
