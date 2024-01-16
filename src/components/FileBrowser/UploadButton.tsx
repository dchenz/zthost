import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import React from "react";
import { ChevronDown } from "react-bootstrap-icons";
import { useDispatch, useSelector } from "react-redux";
import { getPath } from "../../redux/browserSlice";
import { uploadFile } from "../../redux/database/api";
import type { AppDispatch } from "../../store";

const UploadButton: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const path = useSelector(getPath);

  const handleFileUpload = () => {
    const fileForm = document.createElement("input");
    fileForm.type = "file";
    fileForm.multiple = true;
    fileForm.click();
    fileForm.onchange = async (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        return;
      }
      for (const file of files) {
        dispatch(uploadFile(file, path[path.length - 1]?.id ?? null));
      }
    };
  };

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDown />} size="sm">
        Upload
      </MenuButton>
      <MenuList zIndex={999} minW={0} w="150px" padding={0}>
        <MenuItem onClick={handleFileUpload}>File</MenuItem>
        <MenuItem>Folder</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default UploadButton;
