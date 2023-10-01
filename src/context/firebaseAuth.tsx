import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { GoogleDriveStorage } from "../blobstorage/googledrive";
import { ROUTES } from "../config";
import { auth } from "../firebase";
import { useChakraToast } from "../utils";
import { useCurrentUser } from "./user";

type FirebaseAuthContextType = {
  performLogin: () => void;
  performLogout: () => void;
};

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  performLogin: () => undefined,
  performLogout: () => undefined,
});

export const useFirebaseAuth = () => {
  return useContext(FirebaseAuthContext);
};

type FirebaseAuthProviderProps = {
  children: React.ReactNode;
};

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const { setStorageBackend, setUser, setUserAuth, userAuth } =
    useCurrentUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { openToast, updateToast, closeToast } = useChakraToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser({
        uid: user?.uid ?? "",
        photoURL: user?.photoURL ?? "",
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (accessToken && userAuth) {
      setStorageBackend(new GoogleDriveStorage(accessToken, userAuth.bucketId));
    }
  }, [accessToken, userAuth]);

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

  return (
    <FirebaseAuthContext.Provider
      value={{
        performLogin,
        performLogout,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
};
