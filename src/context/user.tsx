import { type User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";

const UserContext = createContext<{
  user: User | null;
}>({
  user: null,
});

export const useCurrentUser = () => {
  return useContext(UserContext);
};

type UserProviderProps = {
  children: React.ReactNode;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
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
        user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
