import { createSlice } from '@reduxjs/toolkit';

export const loginSlice = createSlice({
    name: 'loginSlice',
    initialState: {
        user: {
            name: 'hello',
        },
    },
    reducers: {
        login: (state, action) => {
            state.user = { ...action.payload };
            return state;
        },
    },
});

export const { login } = loginSlice.actions;

export default loginSlice.reducer;
