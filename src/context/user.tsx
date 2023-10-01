import React, { createContext, useContext, useState } from "react";
import type { BlobStorage } from "../blobstorage/model";
import type { AuthProperties, User } from "../database/model";

type UserContextType = {
  setStorageBackend: (storageBackend: BlobStorage | null) => void;
  setUser: (user: User | null) => void;
  setUserAuth: (userAuth: AuthProperties | null) => void;
  storageBackend: BlobStorage | null;
  user: User | null;
  userAuth: AuthProperties | null;
};

type SignedInUserContext = Omit<UserContextType, "user" | "userAuth"> & {
  user: User;
  userAuth: AuthProperties;
};

const UserContext = createContext<UserContextType>({
  setStorageBackend: () => undefined,
  setUser: () => undefined,
  setUserAuth: () => undefined,
  storageBackend: null,
  user: null,
  userAuth: null,
});

export const useSignedInUser = (): SignedInUserContext => {
  const ctx = useContext(UserContext);
  if (!ctx.user) {
    throw new Error("User is not signed-in as expected");
  }
  return ctx as SignedInUserContext;
};

export const useCurrentUser = (): UserContextType => {
  return useContext(UserContext);
};

type UserProviderProps = {
  children: React.ReactNode;
  initialStorageBackend?: BlobStorage;
  initialUser?: User;
  initialUserAuth?: AuthProperties;
};

export const UserProvider: React.FC<UserProviderProps> = ({
  children,
  initialStorageBackend = null,
  initialUser = null,
  initialUserAuth = null,
}) => {
  const [storageBackend, setStorageBackend] = useState<BlobStorage | null>(
    initialStorageBackend
  );
  const [user, setUser] = useState<User | null>(initialUser);
  const [userAuth, setUserAuth] = useState<AuthProperties | null>(
    initialUserAuth
  );

  return (
    <UserContext.Provider
      value={{
        setStorageBackend,
        setUser,
        setUserAuth,
        storageBackend,
        user,
        userAuth,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
