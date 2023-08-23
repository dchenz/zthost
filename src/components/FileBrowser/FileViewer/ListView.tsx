import { Table, TableContainer, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import React from "react";
import ListViewItem from "./ListViewItem";
import type { FolderEntry } from "../../../database/model";

type ListViewProps = {
  items: FolderEntry[];
  onItemClick: (item: FolderEntry) => void;
};

const ListView: React.FC<ListViewProps> = ({ items, onItemClick }) => {
  return (
    <TableContainer className="file-list-container">
      <Table>
        <Thead>
          <Tr className="file-list-header">
            <Th width="70px"></Th>
            <Th>Name</Th>
            <Th width="20%">Created</Th>
            <Th width="10%" isNumeric>
              Size
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((item) => (
            <ListViewItem
              key={item.id}
              item={item}
              onClick={() => onItemClick(item)}
            />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default ListView;
