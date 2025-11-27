import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    batchProductList: {}, // { productID: [batch1, batch2] }
    batchBoxProductList: {}, // { 'productID-batchID': [box1, box2] }
};

export const BatchProductSlice = createSlice({
    name: 'BatchProductSlice',
    initialState,
    reducers: {
        addBatchProductList: (state, action) => {
            const { key, value } = action.payload;
            state.batchProductList[key] = value;
        },
        addBatchBoxProductList: (state, action) => {
            const { key, value } = action.payload;
            state.batchBoxProductList[key] = value;
        },
        addLocationInBatchProductList: (state, action) => {
            const { key, batchID, newLocation } = action.payload;
            state.batchBoxProductList[`${key}-${batchID}`] = newLocation;
        },
        removeBatchProductList: (state, action) => {
            const { key } = action.payload;
            delete state.batchProductList[key];
            // Xóa các box liên quan
            Object.keys(state.batchBoxProductList).forEach((boxKey) => {
                if (boxKey.startsWith(`${key}-`)) {
                    delete state.batchBoxProductList[boxKey];
                }
            });
        },
        removeItemInBatchProductList: (state, action) => {
            const { key, batchID } = action.payload;
            if (state.batchProductList[key]) {
                state.batchProductList[key] = state.batchProductList[key].filter((item) => item.batchID !== batchID);
            }
            // Xóa box tương ứng
            delete state.batchBoxProductList[`${key}-${batchID}`];
        },
        clearAllBatchProductList: (state) => {
            state.batchProductList = {};
            state.batchBoxProductList = {};
        },
    },
});

export const {
    addBatchProductList,
    addBatchBoxProductList,
    addLocationInBatchProductList,
    removeBatchProductList,
    removeItemInBatchProductList,
    clearAllBatchProductList,
} = BatchProductSlice.actions;

export default BatchProductSlice.reducer;
