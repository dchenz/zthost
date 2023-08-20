import type { PopoverProps } from "@chakra-ui/react";
import {
  Center,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import React from "react";
import { Grid, ListUl } from "react-bootstrap-icons";
import { useFiles } from "../../context/files";

const ViewModeSelector = () => {
  const { setViewMode, viewMode } = useFiles();
  return (
    <Popover placement="bottom-end">
      {({ onClose }: PopoverProps) => (
        <React.Fragment>
          <PopoverTrigger>
            <IconButton aria-label="select-view" size="sm">
              {viewMode === "grid" ? <Grid /> : <ListUl />}
            </IconButton>
          </PopoverTrigger>
          <PopoverContent width="100px" p={2}>
            <Center gap={2}>
              <IconButton
                aria-label="grid-mode"
                title="Grid"
                onClick={() => {
                  setViewMode("grid");
                  onClose?.();
                }}
                size="sm"
              >
                <Grid />
              </IconButton>
              <IconButton
                aria-label="list-mode"
                title="List"
                onClick={() => {
                  setViewMode("list");
                  onClose?.();
                }}
                size="sm"
              >
                <ListUl />
              </IconButton>
            </Center>
          </PopoverContent>
        </React.Fragment>
      )}
    </Popover>
  );
};

export default ViewModeSelector;
