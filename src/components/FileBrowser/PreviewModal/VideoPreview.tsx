import { Box } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import type { FileEntity } from "../../../database/model";

type VideoPreviewProps = {
  file: FileEntity;
  fileBytes: ArrayBuffer;
};

const VideoPreview: React.FC<VideoPreviewProps> = ({ fileBytes }) => {
  const [src, setSrc] = useState("");

  useEffect(() => {
    (async () => {
      const blob = await new Response(fileBytes).blob();
      setSrc(URL.createObjectURL(blob));
    })();
  }, [fileBytes]);

  if (!src) {
    return null;
  }

  return (
    <Box
      display="flex"
      alignItems="stretch"
      justifyContent="center"
      maxHeight="100%"
      overflow="hidden"
      margin="0 auto"
    >
      <video
        style={{
          display: "block",
          objectFit: "cover",
          objectPosition: "center",
        }}
        src={src}
        width="100%"
        height="100%"
        controls={true}
      />
    </Box>
  );
};

export default VideoPreview;
