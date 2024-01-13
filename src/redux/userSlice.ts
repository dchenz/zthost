import { createSlice } from "@reduxjs/toolkit";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../config";
import { GoogleDriveStorage } from "../database/googledrive";
import { auth } from "../firebase";
import { useChakraToast } from "../utils";
import type { AuthProperties, BlobStorage, User } from "../database/model";
import type { RootState } from "../store";
import type { PayloadAction } from "@reduxjs/toolkit";

type UserState = {
  accessToken: string | null;
  storage: BlobStorage | null;
  user: User | null;
  userAuth: AuthProperties | null;
};

const initialState: UserState = {
  accessToken: null,
  storage: null,
  user: null,
  userAuth: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setUserAuth: (state, action: PayloadAction<AuthProperties | null>) => {
      state.userAuth = action.payload;
    },
    initializeStorage: (state) => {
      if (state.accessToken && state.userAuth) {
        state.storage = new GoogleDriveStorage(
          state.accessToken,
          state.userAuth.bucketId
        );
      } else {
        state.storage = null;
      }
    },
  },
});

export const { setUser, setUserAuth, initializeStorage } = userSlice.actions;

export const useLogout = () => {
  const dispatch = useDispatch();

  return useCallback(async () => {
    await auth.signOut();
    dispatch(userSlice.actions.setAccessToken(null));
    dispatch(setUserAuth(null));
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
        navigate(ROUTES.loginWithPassword);
      }
      const credentials = GoogleAuthProvider.credentialFromResult(response);
      if (credentials?.accessToken) {
        dispatch(userSlice.actions.setAccessToken(credentials.accessToken));
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

export const getSignedInUser = (s: RootState) => ({
  ...s.user,
  user: s.user.user!,
  userAuth: s.user.userAuth!,
});

export const getCurrentUser = (s: RootState) => s.user;
