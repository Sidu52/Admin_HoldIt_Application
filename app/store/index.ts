import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import profileReducer from "./slices/profileSlice";
import bookingReducer from "./slices/bookingSlice";
import dashboardSlice from "./slices/dashboardSlice";
import userSlice from "./slices/userSlice";
import driverSlice from "./slices/driverSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    profile: profileReducer,
    booking: bookingReducer,
    dashboard: dashboardSlice,
    user: userSlice,
    driver: driverSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
