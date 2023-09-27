import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "../config";
import { DatabaseProvider } from "../context/database";
import { UserProvider } from "../context/user";
import { Firestore } from "../database/firestore";
import FileBrowser from "./FileBrowser";
import Navbar from "./Navbar";
import PasswordLogin from "./PasswordLogin";
import ProviderLogin from "./ProviderLogin";

const firestoreClient = new Firestore();

const App = () => {
  return (
    <BrowserRouter>
      <DatabaseProvider database={firestoreClient}>
        <UserProvider>
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
                element={<PasswordLogin />}
              />
              <Route path={ROUTES.storage} element={<FileBrowser />} />
            </Routes>
          </ChakraProvider>
        </UserProvider>
      </DatabaseProvider>
    </BrowserRouter>
  );
};

export default App;
