import { Box, CircularProgress, IconButton } from "@chakra-ui/react";
import React from "react";
import { CheckCircleFill } from "react-bootstrap-icons";
import { useFiles } from "../../context/files";

const UploadsTracker: React.FC = () => {
  const { uploads, removeUpload } = useFiles();
  if (uploads.length === 0) {
    return null;
  }
  return (
    <Box
      position="absolute"
      bottom="0"
      right="12px"
      backgroundColor="#ffffff"
      boxShadow="0px 1px 2px 2px rgba(214, 214, 214, 1)"
    >
      {uploads.map((upload) => (
        <Box
          key={upload.id}
          width="400px"
          display="flex"
          alignItems="center"
          padding="4px 12px"
        >
          {upload.ok ? (
            <IconButton
              variant="ghost"
              aria-label="close"
              onClick={() => removeUpload(upload.id)}
              borderRadius="50%"
            >
              <CheckCircleFill color="#3db535" size="24px" />
            </IconButton>
          ) : (
            <Box borderRadius="50%" padding="8px">
              <CircularProgress
                size="24px"
                thickness="12px"
                value={upload.progress * 100}
              />
            </Box>
          )}
          <Box
            title={upload.title}
            marginLeft="12px"
            textOverflow="ellipsis"
            overflow="hidden"
            whiteSpace="nowrap"
          >
            {upload.title}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default UploadsTracker;
