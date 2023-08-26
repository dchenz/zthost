import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import React from "react";
import { ChevronDown } from "react-bootstrap-icons";
import { useFiles } from "../../context/files";
import { useSignedInUser } from "../../context/user";

const UploadButton: React.FC = () => {
  const { fileHandler } = useSignedInUser();
  const { path, addItem, addTask, setTaskProgress } = useFiles();

  const uploadFiles = async (files: FileList) => {
    for (const file of files) {
      const f = await fileHandler.uploadFile(
        file,
        path[path.length - 1]?.id ?? null,
        (id) => addTask("upload", id, file.name),
        setTaskProgress,
        (id) => setTaskProgress(id, 1, true)
      );
      addItem(f);
    }
  };

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDown />} size="sm">
        Upload
      </MenuButton>
      <MenuList zIndex={999}>
        <MenuItem
          onClick={() => {
            const fileForm = document.createElement("input");
            fileForm.type = "file";
            fileForm.multiple = true;
            fileForm.click();
            fileForm.onchange = async (e: Event) => {
              const files = (e.target as HTMLInputElement).files;
              if (!files || files.length === 0) {
                return;
              }
              uploadFiles(files);
            };
          }}
        >
          File
        </MenuItem>
        <MenuItem>Folder</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default UploadButton;
