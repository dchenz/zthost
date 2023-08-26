import { Text, VStack } from "@chakra-ui/react";
import React from "react";
import { formatBinarySize } from "../../../utils";
import type { FileEntity } from "../../../database/model";

type FileDetailsProps = {
  file: FileEntity;
};

const FileDetails: React.FC<FileDetailsProps> = ({ file }) => {
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
    </VStack>
  );
};

export default FileDetails;
