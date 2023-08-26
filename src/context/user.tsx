import { GoogleAuthProvider, signInWithPopup, type User } from "firebase/auth";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { GoogleDriveStorage } from "../blobstorage/googledrive";
import { FileHandler } from "../database/files";
import { auth } from "../firebase";

type UserContext = {
  fileHandler: FileHandler | null;
  performLogin: () => void;
  setEncryptionKey: (encryptionKey: ArrayBuffer | null) => void;
  user: User | null;
};

type SignedInUserContext = Omit<UserContext, "fileHandler" | "user"> & {
  fileHandler: FileHandler;
  user: User;
};

const Context = createContext<UserContext>({
  fileHandler: null,
  performLogin: () => undefined,
  setEncryptionKey: () => undefined,
  user: null,
});

export const useSignedInUser = (): SignedInUserContext => {
  const ctx = useContext(Context);
  if (!ctx.user) {
    throw new Error("User is not signed-in as expected");
  }
  return ctx as SignedInUserContext;
};

export const useCurrentUser = (): UserContext => {
  return useContext(Context);
};

type UserProviderProps = {
  children: React.ReactNode;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [encryptionKey, setEncryptionKey] = useState<ArrayBuffer | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const performLogin = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/drive.file");
    const response = await signInWithPopup(auth, provider);
    if (response.user) {
      navigate("/login/password");
    }
    const credentials = GoogleAuthProvider.credentialFromResult(response);
    if (credentials?.accessToken) {
      setAccessToken(credentials.accessToken);
    }
  }, []);

  const fileHandler = useMemo(() => {
    if (accessToken && encryptionKey && user) {
      return new FileHandler(
        new GoogleDriveStorage(accessToken),
        encryptionKey,
        user
      );
    }
    return null;
  }, [accessToken, encryptionKey, user]);

  return (
    <Context.Provider
      value={{
        fileHandler,
        performLogin,
        setEncryptionKey,
        user,
      }}
    >
      {children}
    </Context.Provider>
  );
};
