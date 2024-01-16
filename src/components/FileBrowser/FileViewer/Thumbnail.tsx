import { Image } from "@chakra-ui/react";
import React from "react";
import { useGetThumbnailQuery } from "../../../redux/database/actions";
import type { FolderEntry } from "../../../database/model";
import type { ImageProps } from "@chakra-ui/react";

type ThumbnailProps = Omit<ImageProps, "src"> & {
  item: FolderEntry;
};

const DEFAULT_ICONS = {
  file: "/static/media/file-icon.png",
  folder: "/static/media/folder-icon.png",
};

const Thumbnail: React.FC<ThumbnailProps> = ({ item, ...props }) => {
  const { data: dataUri } = useGetThumbnailQuery(
    { fileId: item.id },
    { skip: item.type !== "file" }
  );

  return <Image {...props} src={dataUri || DEFAULT_ICONS[item.type]} />;
};

export default Thumbnail;
