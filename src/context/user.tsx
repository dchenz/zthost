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
import type { AuthProperties } from "../database/model";

type UserContext = {
  fileHandler: FileHandler | null;
  performLogin: () => void;
  performLogout: () => void;
  setUserAuth: (userAuth: AuthProperties) => void;
  user: User | null;
};

type SignedInUserContext = Omit<UserContext, "fileHandler" | "user"> & {
  fileHandler: FileHandler;
  user: User;
};

const Context = createContext<UserContext>({
  fileHandler: null,
  performLogin: () => undefined,
  performLogout: () => undefined,
  setUserAuth: () => undefined,
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
  const [userAuth, setUserAuth] = useState<AuthProperties | null>(null);
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

  const performLogout = useCallback(async () => {
    await auth.signOut();
    setAccessToken(null);
    setUserAuth(null);
    setUser(null);
    navigate("/login");
  }, []);

  const fileHandler = useMemo(() => {
    if (accessToken && userAuth && user) {
      return new FileHandler(
        new GoogleDriveStorage(accessToken),
        userAuth,
        user
      );
    }
    return null;
  }, [accessToken, userAuth, user]);

  return (
    <Context.Provider
      value={{
        fileHandler,
        performLogin,
        performLogout,
        setUserAuth,
        user,
      }}
    >
      {children}
    </Context.Provider>
  );
};
