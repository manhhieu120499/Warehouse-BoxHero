import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './login.reducer';

const store = configureStore({
    reducer: {
        loginReducer: loginReducer,
    },
});

export default store;
