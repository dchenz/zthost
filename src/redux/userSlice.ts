import { createSlice } from "@reduxjs/toolkit";
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
