import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
            <Route path="/login" element={<ProviderLogin />} />
            <Route path="/login/password" element={<PasswordLogin />} />
            <Route path="/" element={<FileBrowser />} />
          </Routes>
        </UserProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
};

export default App;
