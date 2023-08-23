import { Image, Td, Tr } from "@chakra-ui/react";
import React from "react";
import { formatBinarySize, formatRelativeTime } from "../../../utils";
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
      _hover={{ backgroundColor: "#f5f5f5" }}
    >
      <Td onClick={onClick} padding="5px">
        <Image
          src={
            item.type === "file"
              ? "/static/media/file-icon.png"
              : "/static/media/folder-icon.png"
          }
          height="30px"
          margin="0 auto"
        />
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
