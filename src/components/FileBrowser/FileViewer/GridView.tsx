import { Box, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import GridViewItem from "./GridViewItem";
import type { FolderEntry } from "../../../database/model";

type GridViewProps = {
  items: FolderEntry[];
  onItemClick: (item: FolderEntry) => void;
};

const GridView: React.FC<GridViewProps> = ({ items, onItemClick }) => {
  return (
    <Box
      // Subtract navbar, toolbar and path viewer.
      height="calc(100vh - 48px - 48px - 40px)"
      overflowY="scroll"
    >
      <SimpleGrid columns={[1, 2, 3, 4, 5, 6]} spacing={8} p={3}>
        {items.map((item) => (
          <GridViewItem
            key={item.id}
            item={item}
            onClick={() => onItemClick(item)}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default GridView;
