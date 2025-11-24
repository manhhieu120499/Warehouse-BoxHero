import { createSlice } from '@reduxjs/toolkit';

export const employeeSlice = createSlice({
    name: 'employeeSlice',
    initialState: {
        employee: {},
    },
    reducers: {
        setEmployee: (state, action) => {
            state.employee = { ...action.payload };
            return state;
        },
    },
});

export const { setEmployee } = employeeSlice.actions;

export default employeeSlice.reducer;
