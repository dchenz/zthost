import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Unable to find root");
}
ReactDOM.createRoot(root).render(<App />);
