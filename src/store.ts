import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { browserSlice } from "./redux/browserSlice";
import { databaseApi } from "./redux/databaseApi";
import { taskSlice } from "./redux/taskSlice";
import { userSlice } from "./redux/userSlice";

export const store = configureStore({
  reducer: combineReducers({
    browser: browserSlice.reducer,
    api: databaseApi.reducer,
    tasks: taskSlice.reducer,
    user: userSlice.reducer,
  }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(databaseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type RootStore = typeof store;
