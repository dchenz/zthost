import { Button } from "@chakra-ui/button";
import React, { useMemo } from "react";
import { Check } from "react-bootstrap-icons";
import { useFiles } from "../../../context/files";
import type { FolderEntry } from "../../../database/model";

type SelectorProps = {
  isSelected: boolean;
  onSelect: () => void;
  show: boolean;
};

const Selector: React.FC<SelectorProps> = ({ isSelected, onSelect, show }) => {
  return (
    <Button
      minW="24px"
      height="24px"
      display={show ? "flex" : "none"}
      alignItems="center"
      justifyContent="center"
      margin="0 auto"
      border="solid 0.5px grey"
      backgroundColor={isSelected ? "#5a5aa2" : "#ffffff"}
      fontSize="18px"
      role="checkbox"
      padding={0}
      onClick={onSelect}
      _groupHover={{ display: "flex" }}
      _hover={{ backgroundColor: "auto" }}
    >
      {isSelected ? <Check color={isSelected ? "#ffffff" : "#000000"} /> : null}
    </Button>
  );
};

type ItemSelectorProps = {
  allowMultiSelect?: boolean;
  item: FolderEntry;
};

export const ItemSelector: React.FC<ItemSelectorProps> = ({
  allowMultiSelect = true,
  item,
}) => {
  const { selectedItems, setSelectedItems, toggleSelectedItem } = useFiles();

  const isSelected = useMemo(() => {
    return selectedItems.find((f) => f.id === item.id) !== undefined;
  }, [item, selectedItems]);

  const onSelect = () => {
    if (allowMultiSelect) {
      toggleSelectedItem(item);
    } else {
      if (selectedItems.length > 0 && selectedItems[0].id === item.id) {
        setSelectedItems([]);
      } else {
        setSelectedItems([item]);
      }
    }
  };

  return (
    <Selector
      isSelected={isSelected}
      onSelect={onSelect}
      show={selectedItems.length > 0}
    />
  );
};

export const AllSelector: React.FC = () => {
  const { selectedItems, setSelectedItems, items } = useFiles();

  const isSelected = items.length > 0 && items.length === selectedItems.length;

  const onSelect = () => {
    if (isSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items);
    }
  };

  return (
    <Selector
      isSelected={isSelected}
      onSelect={onSelect}
      show={items.length > 0}
    />
  );
};
