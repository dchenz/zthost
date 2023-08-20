import { type User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";

type UserContextType = {
  encryptionKey: ArrayBuffer | null;
  setEncryptionKey: (encryptionKey: ArrayBuffer | null) => void;
  user: User | null;
};

const UserContext = createContext<UserContextType>({
  encryptionKey: null,
  setEncryptionKey: () => undefined,
  user: null,
});

export const useCurrentUser = () => {
  return useContext(UserContext);
};

type UserProviderProps = {
  children: React.ReactNode;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [encryptionKey, setEncryptionKey] = useState<ArrayBuffer | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <UserContext.Provider
      value={{
        encryptionKey,
        setEncryptionKey,
        user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
