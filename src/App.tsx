import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthRequired from "./components/AuthRequired";
import FileBrowser from "./components/FileBrowser";
import Navbar from "./components/Navbar";
import PasswordLogin from "./components/PasswordLogin";
import ProviderLogin from "./components/ProviderLogin";
import { ROUTES } from "./config";
import { store } from "./store";

const App = () => {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <ChakraProvider>
          <Navbar />
          <Routes>
            <Route
              path={ROUTES.index}
              element={<Navigate to={ROUTES.storage} replace />}
            />
            <Route
              path={ROUTES.loginWithProvider}
              element={<ProviderLogin />}
            />
            <Route
              path={ROUTES.loginWithPassword}
              element={
                <AuthRequired>
                  <PasswordLogin />
                </AuthRequired>
              }
            />
            <Route
              path={ROUTES.storage}
              element={
                <AuthRequired>
                  <FileBrowser />
                </AuthRequired>
              }
            />
          </Routes>
        </ChakraProvider>
      </Provider>
    </BrowserRouter>
  );
};

export default App;
