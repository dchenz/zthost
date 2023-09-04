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
import { auth, ROUTES } from "../config";
import { FileHandler } from "../database/files";
import { useChakraToast } from "../utils";
import type { BlobStorage } from "../blobstorage/model";
import type { AuthProperties } from "../database/model";

type UserContext = {
  fileHandler: FileHandler | null;
  performLogin: () => void;
  performLogout: () => void;
  setUserAuth: (userAuth: AuthProperties) => void;
  storageBackend: BlobStorage | null;
  user: User | null;
};

type SignedInUserContext = Omit<
  UserContext,
  "fileHandler" | "storageBackend" | "user"
> & {
  fileHandler: FileHandler;
  storageBackend: BlobStorage;
  user: User;
};

const Context = createContext<UserContext>({
  fileHandler: null,
  performLogin: () => undefined,
  performLogout: () => undefined,
  setUserAuth: () => undefined,
  storageBackend: null,
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
  const { openToast, updateToast, closeToast } = useChakraToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const performLogin = useCallback(async () => {
    openToast({
      title: "Waiting for confirmation.",
      status: "info",
      duration: null,
    });
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/drive.file");
    try {
      const response = await signInWithPopup(auth, provider);
      if (response.user) {
        closeToast();
        navigate(ROUTES.loginWithPassword);
      }
      const credentials = GoogleAuthProvider.credentialFromResult(response);
      if (credentials?.accessToken) {
        setAccessToken(credentials.accessToken);
      }
    } catch {
      updateToast({
        title: "Unable to sign in with Google. Please try again.",
        status: "error",
        duration: 3000,
      });
    }
  }, []);

  const performLogout = useCallback(async () => {
    await auth.signOut();
    setAccessToken(null);
    setUserAuth(null);
    setUser(null);
    navigate(ROUTES.loginWithProvider);
  }, []);

  const storageBackend = useMemo(() => {
    if (accessToken) {
      return new GoogleDriveStorage(accessToken, userAuth?.bucketId ?? "");
    }
    return null;
  }, [accessToken, userAuth?.bucketId]);

  const fileHandler = useMemo(() => {
    if (storageBackend && userAuth && user) {
      return new FileHandler(storageBackend, userAuth, user);
    }
    return null;
  }, [storageBackend, userAuth, user]);

  return (
    <Context.Provider
      value={{
        fileHandler,
        performLogin,
        performLogout,
        setUserAuth,
        storageBackend,
        user,
      }}
    >
      {children}
    </Context.Provider>
  );
};
