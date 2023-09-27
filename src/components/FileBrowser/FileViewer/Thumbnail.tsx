import { Image } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useDatabase } from "../../../context/database";
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
  const database = useDatabase();
  const [dataUri, setDataUri] = useState(DEFAULT_ICONS[item.type]);

  useEffect(() => {
    if (item.type === "file" && item.hasThumbnail) {
      database.getThumbnail(item.id).then((thumbnail) => {
        if (thumbnail) {
          setDataUri(thumbnail);
        }
      });
    }
  }, [item]);

  return <Image {...props} src={dataUri} />;
};

export default Thumbnail;
