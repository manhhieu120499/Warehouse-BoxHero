import { configureStore } from "@reduxjs/toolkit";
import AuthSlice from "./auth/authSlice";
import LoadingSlice from "./loading/slice";

export const store = configureStore({
    reducer: {
        AuthSlice,
        LoadingSlice
    }
})