import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from "../context/user";
import Login from "./Login";

const App = () => {
  return (
    <ChakraProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ChakraProvider>
  );
};

export default App;
