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
    <TableContainer
      // Subtract navbar, toolbar and path viewer.
      height="calc(100vh - 48px - 48px - 40px)"
      // Push to the right to account for scrollbar.
      pr={3}
      overflowX="unset"
      overflowY="scroll"
    >
      <Table>
        <Thead
          position="sticky"
          top={0}
          zIndex="docked"
          backgroundColor="#ffffff"
          boxShadow="0px 0.5px 1px 1px #f5f5f5"
        >
          <Tr height="40px">
            <Th padding="5px" width="70px"></Th>
            <Th padding="5px">Name</Th>
            <Th padding="5px" width="20%">
              Created
            </Th>
            <Th padding="5px" width="10%" isNumeric>
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
