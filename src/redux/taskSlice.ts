import { createSlice } from "@reduxjs/toolkit";
import type { FileEntity } from "../database/model";
import type { RootState } from "../store";
import type { Dispatch, PayloadAction } from "@reduxjs/toolkit";

export type PendingTask = {
  id: string;
  // Need to mark an upload/download as ok because it
  // may still be pending when XHR reports 100% progress.
  ok?: boolean;
  progress: number;
  title: string;
  type: "download" | "upload";
};

type TaskState = {
  isLoading: boolean;
  tasks: PendingTask[];
};

const initialState: TaskState = {
  tasks: [],
  isLoading: false,
};

export const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<PendingTask>) => {
      state.tasks.push(action.payload);
    },
    removeTask: (state, action: PayloadAction<string>): void => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
    updateTask: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<PendingTask> }>
    ) => {
      const { id, updates } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
      }
    },
  },
});

export const { removeTask, updateTask } = taskSlice.actions;

export const addDownloadTask =
  (file: FileEntity) => async (dispatch: Dispatch) => {
    dispatch(
      taskSlice.actions.addTask({
        id: file.id,
        title: `Preparing to download '${file.metadata.name}'`,
        progress: 0,
        type: "download",
      })
    );
    return file.id;
  };

export const addUploadTask =
  (id: string, name: string) => async (dispatch: Dispatch) => {
    dispatch(
      taskSlice.actions.addTask({
        id,
        title: `Preparing to upload '${name}'`,
        progress: 0,
        type: "upload",
      })
    );
  };

export const getTasks = (s: RootState) => s.tasks.tasks;
