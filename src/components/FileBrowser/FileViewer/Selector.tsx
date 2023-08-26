import { Button } from "@chakra-ui/button";
import React, { useMemo } from "react";
import { Check } from "react-bootstrap-icons";
import { useFiles } from "../../../context/files";
import type { FolderEntry } from "../../../database/model";

type SelectorProps = {
  item: FolderEntry;
};

const Selector: React.FC<SelectorProps> = ({ item }) => {
  const { selectedItems, toggleSelectedItem } = useFiles();

  const isSelected = useMemo(() => {
    return selectedItems.find((f) => f.id === item.id) !== undefined;
  }, [item, selectedItems]);

  const onSelect = () => {
    toggleSelectedItem(item);
  };

  return (
    <Button
      minW="24px"
      height="24px"
      display={selectedItems.length ? "flex" : "none"}
      alignItems="center"
      justifyContent="center"
      margin="0 auto"
      border="solid 0.5px grey"
      backgroundColor={-isSelected ? "#5a5aa2" : "#ffffff"}
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

export default Selector;
