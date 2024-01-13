import { createSlice } from "@reduxjs/toolkit";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../config";
import { auth } from "../firebase";
import { useChakraToast } from "../utils";
import type { AuthProperties, User } from "../database/model";
import type { PayloadAction } from "@reduxjs/toolkit";

type UserState = {
  accessToken: string | null;
  user: User | null;
  userAuth: AuthProperties | null;
};

const initialState: UserState = {
  user: null,
  userAuth: null,
  accessToken: null,
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
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
  },
});

export const { setUser, setUserAuth, setAccessToken } = userSlice.actions;

export const useLogout = () => {
  const dispatch = useDispatch();

  return useCallback(async () => {
    await auth.signOut();
    dispatch(setAccessToken(null));
    dispatch(setUserAuth(null));
    dispatch(setUser(null));
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
        dispatch(setAccessToken(credentials.accessToken));
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
