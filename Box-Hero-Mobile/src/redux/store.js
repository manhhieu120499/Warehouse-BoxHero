import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './login.reducer';
import employeeReducer from './employee.reducer';
import warehouseReducer from './warehouse.reducer';

const store = configureStore({
    reducer: {
        loginReducer: loginReducer,
        employeeReducer: employeeReducer,
        warehouseReducer: warehouseReducer,
    },
});

export default store;
