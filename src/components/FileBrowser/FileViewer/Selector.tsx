import { Button } from "@chakra-ui/button";
import React, { useMemo } from "react";
import { Check } from "react-bootstrap-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  getPath,
  getSelectedItems,
  setSelectedItems,
  toggleSelectedItem,
} from "../../../redux/browserSlice";
import { useFolderContents } from "../../../redux/database/actions";
import type { FolderEntry } from "../../../database/model";
import type { AppDispatch } from "../../../store";

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
  const dispatch = useDispatch<AppDispatch>();
  const selectedItems = useSelector(getSelectedItems);

  const isSelected = useMemo(() => {
    return selectedItems.find((f) => f.id === item.id) !== undefined;
  }, [item, selectedItems]);

  const onSelect = () => {
    if (allowMultiSelect) {
      dispatch(toggleSelectedItem(item));
    } else {
      if (selectedItems.length > 0 && selectedItems[0].id === item.id) {
        dispatch(setSelectedItems([]));
      } else {
        dispatch(setSelectedItems([item]));
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
  const dispatch = useDispatch<AppDispatch>();
  const selectedItems = useSelector(getSelectedItems);
  const path = useSelector(getPath);

  const { data: items = [] } = useFolderContents(
    path[path.length - 1]?.id ?? null
  );

  const isSelected = items.length > 0 && items.length === selectedItems.length;

  const onSelect = () => {
    if (isSelected) {
      dispatch(setSelectedItems([]));
    } else {
      dispatch(setSelectedItems(items));
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
