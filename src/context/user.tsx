import React, { createContext, useContext, useState } from "react";
import type { BlobStorage } from "../blobstorage/model";
import type { AuthProperties, User } from "../database/model";

type UserContext = {
  setStorageBackend: (storageBackend: BlobStorage | null) => void;
  setUser: (user: User | null) => void;
  setUserAuth: (userAuth: AuthProperties | null) => void;
  storageBackend: BlobStorage | null;
  user: User | null;
  userAuth: AuthProperties | null;
};

type SignedInUserContext = Omit<
  UserContext,
  "storageBackend" | "user" | "userAuth"
> & {
  storageBackend: BlobStorage;
  user: User;
  userAuth: AuthProperties;
};

const Context = createContext<UserContext | undefined>(undefined);

export const useCurrentUser = (): UserContext => {
  const ctx = useContext(Context);
  if (ctx === undefined) {
    throw new Error("Context not found");
  }
  return ctx;
};

export const useSignedInUser = (): SignedInUserContext => {
  const ctx = useCurrentUser();
  if (!ctx.user) {
    throw new Error("User is not signed-in as expected");
  }
  return ctx as SignedInUserContext;
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
    <Context.Provider
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
    </Context.Provider>
  );
};
