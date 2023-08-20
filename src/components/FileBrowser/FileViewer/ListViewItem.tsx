import { Image, Td, Tr } from "@chakra-ui/react";
import React from "react";
import { useFiles } from "../../../context/files";
import type { FolderEntry } from "../../../database/model";

type ListViewItemProps = {
  item: FolderEntry;
};

const ListViewItem: React.FC<ListViewItemProps> = ({ item }) => {
  const { path, setPath } = useFiles();

  const navigateToFolder = () => setPath([...path, item]);
  return (
    <Tr
      cursor="pointer"
      maxHeight="40px"
      transition="background-color 300ms"
      _hover={{ backgroundColor: "#f5f5f5" }}
    >
      <Td onClick={navigateToFolder} padding="5px">
        <Image
          src={"/static/media/folder-icon.png"}
          height="30px"
          margin="0 auto"
        />
      </Td>
      <Td onClick={navigateToFolder} padding="5px">
        {item.name}
      </Td>
      <Td onClick={navigateToFolder} padding="5px"></Td>
      <Td onClick={navigateToFolder} padding="5px" isNumeric></Td>
    </Tr>
  );
};

export default ListViewItem;
