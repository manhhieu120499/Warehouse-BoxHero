import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './login.reducer';
import employeeReducer from './employee.reducer';
import warehouseReducer from './warehouse.reducer';
import { AuthSlice } from './auth/authSlice';
import BatchProductSlice from './batchProduct/BatchProductSlice';

const store = configureStore({
    reducer: {
        loginReducer: loginReducer,
        employeeReducer: employeeReducer,
        warehouseReducer: warehouseReducer,
        AuthSlice: AuthSlice.reducer,
        BatchProductSlice: BatchProductSlice,
    },
});

export default store;
