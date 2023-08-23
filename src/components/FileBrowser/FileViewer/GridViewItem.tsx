import { Box, Image, Text } from "@chakra-ui/react";
import React from "react";
import { useFiles } from "../../../context/files";
import type { FolderEntry } from "../../../database/model";

type GridViewItemProps = {
  item: FolderEntry;
};

const GridViewItem: React.FC<GridViewItemProps> = ({ item }) => {
  const { path, setPath } = useFiles();
  return (
    <Box
      cursor="pointer"
      position="relative"
      transition="background-color 300ms"
      width="200px"
      _hover={{ backgroundColor: "#f5f5f5" }}
      onClick={() => setPath([...path, item])}
    >
      <Image
        src={"/static/media/folder-icon.png"}
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
