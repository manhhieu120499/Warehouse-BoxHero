import { createSlice } from '@reduxjs/toolkit';

export const warehouseSlice = createSlice({
    name: 'warehouseSlice',
    initialState: {
        warehouse: {},
    },
    reducers: {
        setWarehouse: (state, action) => {
            state.warehouse = { ...action.payload };
            return state;
        },
    },
});

export const { setWarehouse } = warehouseSlice.actions;

export default warehouseSlice.reducer;
