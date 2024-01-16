import {
  Box,
  CloseButton,
  Divider,
  HStack,
  IconButton,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { Download, Trash } from "react-bootstrap-icons";
import { useDispatch } from "react-redux";
import { useFiles } from "../../../context/files";
import { setPreviewFile } from "../../../redux/browserSlice";
import { deleteFIlesAndFolders } from "../../../redux/databaseApi";
import { formatBinarySize } from "../../../utils";
import ConfirmPopup from "../../ConfirmPopup";
import type { FileEntity } from "../../../database/model";
import type { AppDispatch } from "../../../store";

type FileDetailsProps = {
  file: FileEntity;
};

const FileDetails: React.FC<FileDetailsProps> = ({ file }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { addDownloadTask } = useFiles();

  const handleDownload = async () => {
    dispatch(setPreviewFile(null));
    addDownloadTask(file);
  };

  const handleDelete = async () => {
    await dispatch(deleteFIlesAndFolders([file]));
    dispatch(setPreviewFile(null));
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
      <HStack width="100%">
        <CloseButton onClick={() => dispatch(setPreviewFile(null))} />
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
        <ConfirmPopup onConfirm={handleDelete} prompt="Delete file?">
          <Tooltip label="Delete">
            <IconButton
              icon={<Trash />}
              aria-label="delete"
              onFocus={(e) => e.preventDefault()}
              size="sm"
              colorScheme="red"
            />
          </Tooltip>
        </ConfirmPopup>
      </HStack>
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
