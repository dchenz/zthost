import { createSlice } from "@reduxjs/toolkit";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../config";
import { auth } from "../firebase";
import { useChakraToast } from "../utils";
import type { StorageProvider } from "../database/blobstorage";
import type { GoogleDriveInfo } from "../database/googledrive";
import type { AuthProperties, User } from "../database/model";
import type { AppDispatch, RootState } from "../store";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User as FirebaseUser } from "firebase/auth";

type UserState = {
  storageStrategy: StorageProvider | null;
  user: User | null;
  userAuth: AuthProperties | null;
};

const initialState: UserState = {
  storageStrategy: null,
  user: null,
  userAuth: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setUserAuth: (state, action: PayloadAction<AuthProperties | null>) => {
      state.userAuth = action.payload;
    },
    setStorageStrategy: (
      state,
      action: PayloadAction<GoogleDriveInfo | null>
    ) => {
      state.storageStrategy = action.payload;
    },
  },
});
export const { setUser, setUserAuth, setStorageStrategy } = userSlice.actions;

export const useLogout = () => {
  const dispatch = useDispatch();

  return useCallback(async () => {
    await auth.signOut();
    dispatch(setUserAuth(null));
    dispatch(setStorageStrategy(null));
    dispatch(userSlice.actions.setUser(null));
  }, []);
};

export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openToast, updateToast, closeToast } = useChakraToast();

  return useCallback(async () => {
    openToast({
      title: "Waiting for confirmation.",
      status: "info",
      duration: null,
    });
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/drive.file");
      const response = await signInWithPopup(auth, provider);
      if (response.user) {
        closeToast();
        navigate(ROUTES.loginWithPassword, { state: { test: 123 } });
      }
      const credentials = GoogleAuthProvider.credentialFromResult(response);
      if (credentials?.accessToken) {
        dispatch(
          setStorageStrategy({
            accessToken: credentials.accessToken,
            rootFolderId: null,
            type: "google",
          })
        );
      }
    } catch (e) {
      updateToast({
        title: "Unable to sign in with Google. Please try again.",
        status: "error",
        duration: 3000,
      });
    }
  }, []);
};

export const setUserOnAuthStateChange = (firebaseUser: FirebaseUser | null) => {
  return (dispatch: AppDispatch) => {
    if (firebaseUser) {
      dispatch(
        setUser({
          uid: firebaseUser.uid,
          photoURL: firebaseUser.photoURL ?? undefined,
        })
      );
    } else {
      dispatch(setUser(null));
    }
  };
};

export const getSignedInUser = (
  s: RootState
): {
  storageStrategy: StorageProvider;
  user: User;
  userAuth: AuthProperties;
} => {
  if (!s.user.storageStrategy || !s.user.user || !s.user.userAuth) {
    throw new Error("Expected user to be signed in");
  }
  // @ts-expect-error TODO: Create a more robust type.
  return s.user;
};

export const getCurrentUser = (s: RootState): UserState => s.user;
