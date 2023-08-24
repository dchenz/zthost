import {
  Box,
  Button,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";
import ListViewItem from "./ListViewItem";
import type { FolderEntry } from "../../../database/model";

type ListViewProps = {
  items: FolderEntry[];
  onItemClick: (item: FolderEntry) => void;
};

const ListView: React.FC<ListViewProps> = ({ items, onItemClick }) => {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [isReversed, setReversed] = useState(false);

  const sortedItems = useMemo(() => {
    if (!sortBy) {
      return items;
    }
    return [...items].sort((a: FolderEntry, b: FolderEntry) => {
      let result = 0;
      switch (sortBy) {
        case "Name":
          result = a.metadata.name.localeCompare(b.metadata.name);
          break;
        case "Created":
          result = a.creationTime.getTime() - b.creationTime.getTime();
          break;
        case "Size":
          // Sort folders last because they don't display size.
          if (a.type === "file" && b.type === "folder") {
            return -1;
          }
          if (a.type === "folder" && b.type === "file") {
            return 1;
          }
          if (a.type === "file" && b.type === "file") {
            result = a.metadata.size - b.metadata.size;
          }
          break;
      }
      return result * (isReversed ? -1 : 1);
    });
  }, [items, sortBy, isReversed]);

  const renderTableHead = (
    name: string | undefined,
    width: string | undefined,
    isNumeric: boolean,
    ascendingMessage?: string,
    descendingMessage?: string
  ) => {
    const isSelected = name === sortBy;
    return (
      <Th padding="5px" width={width} isNumeric={isNumeric}>
        {name ? (
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            justifyContent={isNumeric ? "right" : undefined}
          >
            <Box
              color={isSelected ? "#000000" : undefined}
              textDecoration={isSelected ? "underline" : undefined}
            >
              {name}
            </Box>
            <Tooltip
              label={
                isSelected
                  ? isReversed
                    ? "Click to reset"
                    : descendingMessage
                  : ascendingMessage
              }
              placement="top"
            >
              <Button
                backgroundColor={isSelected ? "#f5f5f5" : undefined}
                borderRadius="50%"
                padding={0}
                size="xs"
                variant="ghost"
                onClick={() => {
                  if (isSelected) {
                    if (isReversed) {
                      setSortBy(null);
                    }
                    setReversed((currentState) => !currentState);
                  } else {
                    setReversed(false);
                    setSortBy(name);
                  }
                }}
              >
                {isSelected && !isReversed ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </Tooltip>
          </Box>
        ) : null}
      </Th>
    );
  };

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
            {renderTableHead(undefined, "70px", false)}
            {renderTableHead(
              "Name",
              undefined,
              false,
              "Click to sort in ascending order",
              "Click to sort in descending order"
            )}
            {renderTableHead(
              "Created",
              "20%",
              false,
              "Click to show oldest first",
              "Click to show newest first"
            )}
            {renderTableHead(
              "Size",
              "10%",
              true,
              "Click to show smallest files first",
              "Click to show largest files first"
            )}
          </Tr>
        </Thead>
        <Tbody>
          {sortedItems.map((item) => (
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
