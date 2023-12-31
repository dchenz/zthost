import { Box, Text } from "@chakra-ui/react";
import React from "react";
import { ItemSelector } from "./Selector";
import Thumbnail from "./Thumbnail";
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
      role="group"
    >
      <Box position="absolute" top="5px" left="5px">
        <ItemSelector item={item} />
      </Box>
      <Box onClick={onClick}>
        <Thumbnail item={item} width="96px" margin="0 auto" />
        <Box p={2}>
          <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
            {item.metadata.name}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default GridViewItem;
