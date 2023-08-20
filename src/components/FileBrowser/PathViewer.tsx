import { Box, Button, HStack } from "@chakra-ui/react";
import React, { useMemo } from "react";
import { ChevronRight } from "react-bootstrap-icons";
import { useFiles } from "../../context/files";
import type { Folder } from "../../database/model";

const PathViewer: React.FC = () => {
  const { path, setPath } = useFiles();

  const { parents, pwd } = useMemo(
    () => ({
      parents: path.slice(0, path.length - 1),
      pwd: path[path.length - 1] ?? null,
    }),
    [path]
  );

  const changeToPreviousFolder = (folder: Folder | null) => {
    const newPath: Folder[] = [];
    if (folder) {
      for (const f of parents) {
        newPath.push(f);
        if (f.id === folder.id) {
          break;
        }
      }
    }
    setPath(newPath);
  };

  const renderPathItem = (folder: Folder | null, link: boolean) => {
    const folderName = (
      <Box
        maxWidth="150px"
        fontSize="16px"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {folder?.name ?? "My Files"}
      </Box>
    );

    if (!link) {
      return folderName;
    }

    return (
      <React.Fragment>
        <Button
          variant="link"
          minWidth={0}
          onClick={() => changeToPreviousFolder(folder)}
        >
          {folderName}
        </Button>
        {link ? (
          <div>
            <ChevronRight />
          </div>
        ) : null}
      </React.Fragment>
    );
  };

  return (
    <HStack minHeight="40px" px={3}>
      {renderPathItem(null, path.length > 0)}
      {parents.map((folder, index) => (
        <React.Fragment key={index}>
          {renderPathItem(folder, true)}
        </React.Fragment>
      ))}
      {pwd ? renderPathItem(pwd, false) : null}
    </HStack>
  );
};

export default PathViewer;
