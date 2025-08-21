import { configureStore } from "@reduxjs/toolkit";
import AuthSlice from "./auth/authSlice";
import LoadingSlice from "./loading/slice";
import DropSideBarSlice from "./dropSidebar/dropSidebarSlice";

export const store = configureStore({
    reducer: {
        AuthSlice,
        LoadingSlice,
        DropSideBarSlice
    }
})