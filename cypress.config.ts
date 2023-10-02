import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
    viewportWidth: 1000,
    viewportHeight: 1000,
    fileServerFolder: "./public",
  },
});
