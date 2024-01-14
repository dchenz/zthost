import { createSlice } from "@reduxjs/toolkit";
import type { FileEntity, Folder, FolderEntry } from "../database/model";
import type { RootState } from "../store";
import type { PayloadAction } from "@reduxjs/toolkit";

type ViewMode = "grid" | "list";

type BrowserState = {
  isLoading: boolean;
  path: Folder[];
  previewFile: FileEntity | null;
  selectedItems: FolderEntry[];
  viewMode: ViewMode;
};

const initialState: BrowserState = {
  previewFile: null,
  selectedItems: [],
  viewMode: "grid",
  path: [],
  isLoading: false,
};

export const browserSlice = createSlice({
  name: "browser",
  initialState,
  reducers: {
    setPreviewFile: (state, action: PayloadAction<FileEntity | null>) => {
      state.previewFile = action.payload;
    },
    setSelectedItems: (state, action: PayloadAction<FolderEntry[]>) => {
      state.selectedItems = action.payload;
    },
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
    setPath: (state, action: PayloadAction<Folder[]>) => {
      state.path = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setPreviewFile,
  setSelectedItems,
  setViewMode,
  setPath,
  setLoading,
} = browserSlice.actions;

export const getViewMode = (s: RootState) => s.browser.viewMode;
