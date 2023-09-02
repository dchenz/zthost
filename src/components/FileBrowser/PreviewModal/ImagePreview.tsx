import { Image } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { blobToDataUri } from "../../../utils";
import type { FileEntity } from "../../../database/model";

type ImagePreviewProps = {
  file: FileEntity;
  fileBytes: ArrayBuffer;
};

const ImagePreview: React.FC<ImagePreviewProps> = ({ file, fileBytes }) => {
  const [src, setSrc] = useState("");

  useEffect(() => {
    (async () => {
      const blob = await new Response(fileBytes).blob();
      const dataUri = await blobToDataUri(blob);
      setSrc(dataUri);
    })();
  }, [fileBytes]);

  if (!src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={file.metadata.name}
      width="100%"
      height="100%"
      objectFit="contain"
    />
  );
};

export default ImagePreview;
