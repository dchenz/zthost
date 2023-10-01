import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "../config";
import { DatabaseProvider } from "../context/database";
import { FirebaseAuthProvider } from "../context/firebaseAuth";
import { UserProvider } from "../context/user";
import { Firestore } from "../database/firestore";
import AuthRequired from "./AuthRequired";
import FileBrowser from "./FileBrowser";
import Navbar from "./Navbar";
import PasswordLogin from "./PasswordLogin";
import ProviderLogin from "./ProviderLogin";

const firestoreClient = new Firestore();

const App = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <FirebaseAuthProvider>
          <DatabaseProvider database={firestoreClient}>
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
          </DatabaseProvider>
        </FirebaseAuthProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
