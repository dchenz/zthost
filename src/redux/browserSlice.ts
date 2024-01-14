import { createSlice } from "@reduxjs/toolkit";
import type { FileEntity, Folder, FolderEntry } from "../database/model";
import type { RootState } from "../store";
import type { Dispatch, PayloadAction } from "@reduxjs/toolkit";

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

export const toggleSelectedItem = (item: FolderEntry) => {
  return (dispatch: Dispatch, getState: () => RootState) => {
    const { selectedItems } = getState().browser;
    const newItems = selectedItems.filter((f) => f.id !== item.id);
    if (newItems.length === selectedItems.length) {
      newItems.push(item);
    }
    dispatch(setSelectedItems(newItems));
  };
};

export const getViewMode = (s: RootState) => s.browser.viewMode;

export const getSelectedItems = (s: RootState) => s.browser.selectedItems;

export const getPath = (s: RootState) => s.browser.path;

export const getPreviewFile = (s: RootState) => s.browser.previewFile;
