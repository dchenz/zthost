import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "../config";
import { DatabaseProvider } from "../context/database";
import { Firestore } from "../database/firestore";
import { store } from "../store";
import AuthRequired from "./AuthRequired";
import FileBrowser from "./FileBrowser";
import Navbar from "./Navbar";
import PasswordLogin from "./PasswordLogin";
import ProviderLogin from "./ProviderLogin";

const firestoreClient = new Firestore();

const App = () => {
  return (
    <BrowserRouter>
      <Provider store={store}>
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
      </Provider>
    </BrowserRouter>
  );
};

export default App;
