import {
  Button,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react";
import React from "react";
import type { PopoverProps } from "@chakra-ui/react";

type ConfirmDeleteProps = {
  children: React.ReactNode;
  onCancel?: () => void;
  onConfirm: () => void;
  prompt: string;
};

const ConfirmPopup: React.FC<ConfirmDeleteProps> = ({
  children,
  onCancel,
  onConfirm,
  prompt,
}) => (
  <Popover>
    {({ onClose }: PopoverProps) => (
      <React.Fragment>
        <PopoverTrigger>{children}</PopoverTrigger>
        <PopoverContent
          rootProps={{
            zIndex: 999,
          }}
        >
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>{prompt}</PopoverHeader>
          <PopoverBody>
            <HStack>
              <Button
                width="100%"
                onClick={() => {
                  onConfirm();
                  onClose?.();
                }}
                size="sm"
              >
                OK
              </Button>
              <Button
                width="100%"
                onClick={() => {
                  onCancel?.();
                  onClose?.();
                }}
                size="sm"
              >
                Cancel
              </Button>
            </HStack>
          </PopoverBody>
        </PopoverContent>
      </React.Fragment>
    )}
  </Popover>
);

export default ConfirmPopup;
