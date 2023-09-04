import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "../config";
import { UserProvider } from "../context/user";
import FileBrowser from "./FileBrowser";
import Navbar from "./Navbar";
import PasswordLogin from "./PasswordLogin";
import ProviderLogin from "./ProviderLogin";

const App = () => {
  return (
    <BrowserRouter>
      <ChakraProvider>
        <UserProvider>
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
              element={<PasswordLogin />}
            />
            <Route path={ROUTES.storage} element={<FileBrowser />} />
          </Routes>
        </UserProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
};

export default App;
