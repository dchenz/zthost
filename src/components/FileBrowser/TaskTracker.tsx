import { Box, CircularProgress, IconButton } from "@chakra-ui/react";
import React from "react";
import { CheckCircleFill } from "react-bootstrap-icons";
import { useFiles } from "../../context/files";

const TaskTracker: React.FC = () => {
  const { tasks, removeTask } = useFiles();

  if (tasks.length === 0) {
    return null;
  }

  return (
    <Box
      position="absolute"
      bottom="0"
      right="24px"
      backgroundColor="#ffffff"
      boxShadow="0px 1px 2px 2px rgba(214, 214, 214, 1)"
    >
      {tasks.map((task) => (
        <Box
          key={task.id}
          width="400px"
          display="flex"
          alignItems="center"
          padding="4px 12px"
        >
          {task.ok ? (
            <IconButton
              variant="ghost"
              aria-label="close"
              onClick={() => removeTask(task.id)}
              borderRadius="50%"
            >
              <CheckCircleFill color="#3db535" size="24px" />
            </IconButton>
          ) : (
            <Box borderRadius="50%" padding="8px">
              <CircularProgress
                size="24px"
                thickness="12px"
                value={task.progress * 100}
              />
            </Box>
          )}
          <Box
            title={task.title}
            marginLeft="12px"
            textOverflow="ellipsis"
            overflow="hidden"
            whiteSpace="nowrap"
          >
            {task.title}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default TaskTracker;
