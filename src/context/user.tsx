import { GoogleAuthProvider, signInWithPopup, type User } from "firebase/auth";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

type UserContextType = {
  encryptionKey: ArrayBuffer | null;
  performLogin: () => void;
  setEncryptionKey: (encryptionKey: ArrayBuffer | null) => void;
  user: User | null;
};

const UserContext = createContext<UserContextType>({
  encryptionKey: null,
  performLogin: () => undefined,
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
  const navigate = useNavigate();
  const [encryptionKey, setEncryptionKey] = useState<ArrayBuffer | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const performLogin = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const response = await signInWithPopup(auth, provider);
    if (response.user) {
      navigate("/login/password");
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        encryptionKey,
        performLogin,
        setEncryptionKey,
        user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
