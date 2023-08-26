import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import React from "react";
import { ChevronDown } from "react-bootstrap-icons";
import { v4 as uuid } from "uuid";
import { useFiles } from "../../context/files";
import { useSignedInUser } from "../../context/user";

const UploadButton: React.FC = () => {
  const { fileHandler } = useSignedInUser();
  const { path, addItem, addTask, updateTask } = useFiles();

  const uploadFiles = async (files: FileList) => {
    for (const file of files) {
      const fileId = uuid();
      addTask("upload", fileId, `Preparing to upload '${file.name}'`);
      const f = await fileHandler.uploadFileMetadata(
        fileId,
        file,
        path[path.length - 1]?.id ?? null
      );
      updateTask(fileId, { title: `Uploading '${file.name}'` });
      await fileHandler.uploadFileChunks(fileId, file, (progress) => {
        updateTask(f.id, { progress });
      });
      updateTask(fileId, {
        progress: 1,
        ok: true,
        title: file.name,
      });
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
