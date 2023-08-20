import React from "react";
import { useFiles } from "../../../context/files";
import GridView from "./GridView";
import ListView from "./ListView";

const FileViewer: React.FC = () => {
  const { viewMode } = useFiles();
  return viewMode === "list" ? <ListView /> : <GridView />;
};

export default FileViewer;
