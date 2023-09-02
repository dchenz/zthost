import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import React from "react";
import { ChevronDown } from "react-bootstrap-icons";
import { useFiles } from "../../context/files";

const UploadButton: React.FC = () => {
  const { addUploadTask } = useFiles();

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
        addUploadTask(file);
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
