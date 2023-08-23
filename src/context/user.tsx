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

type UserContextType = {
  encryptionKey: ArrayBuffer | null;
  fileHandler: FileHandler;
  performLogin: () => void;
  setEncryptionKey: (encryptionKey: ArrayBuffer | null) => void;
  user: User | null;
};

const UserContext = createContext<UserContextType>({
  encryptionKey: null,
  performLogin: () => undefined,
  setEncryptionKey: () => undefined,
  user: null,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  fileHandler: null,
});

export const useCurrentUser = () => {
  return useContext(UserContext);
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

  const fileHandler = useMemo(
    () =>
      new FileHandler(
        new GoogleDriveStorage(accessToken ?? ""),
        encryptionKey ?? new Uint8Array()
      ),
    [accessToken, encryptionKey]
  );

  return (
    <UserContext.Provider
      value={{
        encryptionKey,
        fileHandler,
        performLogin,
        setEncryptionKey,
        user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
