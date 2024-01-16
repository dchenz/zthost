import { Box, Spinner, Text } from "@chakra-ui/react";
import React, { useMemo } from "react";
import { useFileAsBlob } from "../../../redux/database/actions";
import { isImage, isVideo } from "../../../utils";
import ImagePreview from "./ImagePreview";
import VideoPreview from "./VideoPreview";
import type { FileEntity } from "../../../database/model";

type FilePreviewProps = {
  file: FileEntity;
};

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  const { data: fileBytes, error, isLoading } = useFileAsBlob(file);

  const filePreviewContent = useMemo(() => {
    if (!fileBytes) {
      return null;
    }
    if (isImage(file.metadata.type)) {
      return <ImagePreview file={file} fileBytes={fileBytes} />;
    }
    if (isVideo(file.metadata.type)) {
      return <VideoPreview file={file} fileBytes={fileBytes} />;
    }
  }, [file, fileBytes]);

  return (
    <Box
      alignItems="center"
      display="flex"
      flexGrow={1}
      minH="100px"
      justifyContent="center"
    >
      {isLoading ? <Spinner /> : null}
      {error ? <Text color="#777777">{`${error}`}</Text> : null}
      {filePreviewContent}
    </Box>
  );
};

export default FilePreview;
