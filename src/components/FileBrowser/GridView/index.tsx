import { SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { useFiles } from "../../../context/files";
import GridViewItem from "./GridViewItem";

const GridView: React.FC = () => {
  const { items } = useFiles();
  return (
    <SimpleGrid columns={[1, 2, 3, 4, 5, 6]} spacing={8} p={3}>
      {items.map((item) => (
        <GridViewItem key={item.id} item={item} />
      ))}
    </SimpleGrid>
  );
};

export default GridView;
