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
        if (f.id === folder.id) {
          break;
        }
        newPath.push(f);
      }
    }
    setPath(newPath);
  };

  const renderPathItem = (folderName: string) => {
    return (
      <Box
        maxWidth="150px"
        fontSize="16px"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {folderName}
      </Box>
    );
  };

  return (
    <HStack minHeight="40px" px={3}>
      <Button
        variant="link"
        minWidth={0}
        onClick={() => changeToPreviousFolder(null)}
      >
        {renderPathItem("My Files")}
      </Button>
      {path.length ? (
        <div>
          <ChevronRight />
        </div>
      ) : null}
      {parents.map((folder, k) => (
        <React.Fragment key={k}>
          <Button
            variant="link"
            minWidth={0}
            onClick={() => changeToPreviousFolder(folder)}
          >
            {renderPathItem(folder.name)}
          </Button>
          <div>
            <ChevronRight />
          </div>
        </React.Fragment>
      ))}
      {pwd ? renderPathItem(pwd.name) : null}
    </HStack>
  );
};

export default PathViewer;
