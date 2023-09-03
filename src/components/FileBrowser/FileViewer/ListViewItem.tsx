import { Td, Tr } from "@chakra-ui/react";
import React from "react";
import { formatBinarySize, formatRelativeTime } from "../../../utils";
import { ItemSelector } from "./Selector";
import Thumbnail from "./Thumbnail";
import type { FolderEntry } from "../../../database/model";
import type { TableRowProps } from "@chakra-ui/react";

type ListViewItemProps = {
  allowMultiSelect?: boolean;
  disabled?: boolean;
  item: FolderEntry;
  onClick: () => void;
};

const ListViewItem: React.FC<ListViewItemProps> = ({
  allowMultiSelect = true,
  disabled,
  item,
  onClick,
}) => {
  const rowProps: TableRowProps = {
    cursor: "pointer",
    maxHeight: "40px",
    transition: "background-color 300ms",
    role: "group",
    _hover: { backgroundColor: "#f5f5f5" },
  };
  if (disabled) {
    rowProps["aria-disabled"] = true;
    rowProps.color = "grey";
    rowProps.cursor = undefined;
    rowProps._hover = undefined;
  }

  const onClickIfActive = disabled ? undefined : onClick;

  return (
    <Tr {...rowProps}>
      <Td padding="5px">
        {!disabled ? (
          <ItemSelector allowMultiSelect={allowMultiSelect} item={item} />
        ) : null}
      </Td>
      <Td onClick={onClickIfActive} padding="5px">
        <Thumbnail item={item} height="30px" margin="0 auto" />
      </Td>
      <Td onClick={onClickIfActive} padding="5px">
        {item.metadata.name}
      </Td>
      <Td onClick={onClickIfActive} padding="5px">
        {formatRelativeTime(item.creationTime)}
      </Td>
      <Td onClick={onClickIfActive} padding="5px" isNumeric>
        {item.type === "file" ? formatBinarySize(item.metadata.size) : null}
      </Td>
    </Tr>
  );
};

export default ListViewItem;
