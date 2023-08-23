import { Box, Image, Text } from "@chakra-ui/react";
import React from "react";
import type { FolderEntry } from "../../../database/model";

type GridViewItemProps = {
  item: FolderEntry;
  onClick: () => void;
};

const GridViewItem: React.FC<GridViewItemProps> = ({ item, onClick }) => {
  return (
    <Box
      cursor="pointer"
      position="relative"
      transition="background-color 300ms"
      width="200px"
      _hover={{ backgroundColor: "#f5f5f5" }}
      onClick={onClick}
    >
      <Image
        src={
          item.type === "file"
            ? "/static/media/file-icon.png"
            : "/static/media/folder-icon.png"
        }
        alt={item.metadata.name}
        width="96px"
        margin="0 auto"
      />
      <Box p={2}>
        <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
          {item.metadata.name}
        </Text>
      </Box>
    </Box>
  );
};

export default GridViewItem;