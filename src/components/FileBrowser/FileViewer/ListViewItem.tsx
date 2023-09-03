import { Td, Tr } from "@chakra-ui/react";
import React from "react";
import { formatBinarySize, formatRelativeTime } from "../../../utils";
import { ItemSelector } from "./Selector";
import Thumbnail from "./Thumbnail";
import type { FolderEntry } from "../../../database/model";

type ListViewItemProps = {
  item: FolderEntry;
  onClick: () => void;
};

const ListViewItem: React.FC<ListViewItemProps> = ({ item, onClick }) => {
  return (
    <Tr
      cursor="pointer"
      maxHeight="40px"
      transition="background-color 300ms"
      role="group"
      _hover={{ backgroundColor: "#f5f5f5" }}
    >
      <Td padding="5px">
        <ItemSelector item={item} />
      </Td>
      <Td onClick={onClick} padding="5px">
        <Thumbnail item={item} height="30px" margin="0 auto" />
      </Td>
      <Td onClick={onClick} padding="5px">
        {item.metadata.name}
      </Td>
      <Td onClick={onClick} padding="5px">
        {formatRelativeTime(item.creationTime)}
      </Td>
      <Td onClick={onClick} padding="5px" isNumeric>
        {item.type === "file" ? formatBinarySize(item.metadata.size) : null}
      </Td>
    </Tr>
  );
};

export default ListViewItem;
