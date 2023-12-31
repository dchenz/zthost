import { Box, Spinner, Text } from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import { useDatabase } from "../../../context/database";
import { isImage, isVideo } from "../../../utils";
import ImagePreview from "./ImagePreview";
import VideoPreview from "./VideoPreview";
import type { FileEntity } from "../../../database/model";

type FilePreviewProps = {
  file: FileEntity;
};

const NOT_SUPPORTED = "No preview available for this file type.";
const TOO_LARGE = "File is too large to preview.";

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  const database = useDatabase();
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const supportsPreview =
      isImage(file.metadata.type) || isVideo(file.metadata.type);
    if (supportsPreview) {
      setLoading(true);
      database
        .downloadFileInMemory(file.id)
        .then((data) => {
          if (!data) {
            setMessage(TOO_LARGE);
          }
          setFileBytes(data);
        })
        .finally(() => setLoading(false));
    } else {
      setMessage(NOT_SUPPORTED);
    }
  }, [file]);

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
      {message ? <Text color="#777777">{message}</Text> : null}
      {filePreviewContent}
    </Box>
  );
};

export default FilePreview;
