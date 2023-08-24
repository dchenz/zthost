import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import React from "react";
import { ChevronDown } from "react-bootstrap-icons";
import { useFiles } from "../../context/files";
import { useCurrentUser } from "../../context/user";

const UploadButton: React.FC = () => {
  const { fileHandler, user } = useCurrentUser();
  const { path, addItem, addUpload, setUploadProgress } = useFiles();

  if (!user) {
    return null;
  }

  const uploadFiles = async (files: FileList) => {
    for (const file of files) {
      const f = await fileHandler.uploadFile(
        file,
        path[path.length - 1]?.id ?? null,
        user.uid,
        (id) => addUpload(id, file.name),
        setUploadProgress,
        (id) => setUploadProgress(id, 1, true)
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
