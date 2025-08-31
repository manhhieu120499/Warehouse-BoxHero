import React, { Fragment, useEffect, useState } from "react";
import { Routes, Route, Outlet, useNavigate, Navigate } from "react-router-dom";
import { publicRoute } from "./routes";
import DefaultLayout from "./layouts/DefaultLayout";
import {Toaster} from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { post } from "./utils/httpRequest";
import EmployeeDTO from "./dtos/EmployeeDTO";
import { login } from "./lib/redux/auth/authSlice";
import { setGlobalLoadingHandler } from "../src/utils/httpRequest";
import { Loading } from "./components";
import { changDropItem } from "./lib/redux/dropSidebar/dropSidebarSlice";
import { addInfo } from "./lib/redux/warehouse/wareHouseSlice";

const RootLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async (accessToken, email, employeeID) => {
            try {
                const { roles } = jwtDecode(accessToken).payload;
                const responseUser = await post(
                    '/api/employee/employee-detail',
                    {
                        email: email,
                    },
                    accessToken,
                    employeeID
                );
                const {employee} = responseUser
                dispatch(login({ ...new EmployeeDTO({ ...employee, roles }) }));

                const itemDropActiveSidebar = JSON.parse(localStorage.getItem('indexItemDropActive')) || []
                dispatch(changDropItem(itemDropActiveSidebar))
            } catch (err) {
                navigate('/login')
                localStorage.setItem('tokenUser', null)
                localStorage.setItem('indexItemDropActive', [])
                localStorage.setItem('warehouse', null)
                console.log(err);
            }
        };
        const warehouse = localStorage.getItem('warehouse')
        if(warehouse && warehouse != 'null') {
            dispatch(addInfo(JSON.parse(warehouse)))
        }
        const tokenUser = localStorage.getItem('tokenUser');
        if (tokenUser && tokenUser != 'null') {
            const { employeeID, email, accessToken, refreshToken } = JSON.parse(localStorage.getItem('tokenUser'));
            fetchUser(accessToken, email, employeeID);
        }else {
            navigate('/login')
        }
    }, [])
  return <Outlet/>
}

function App() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setGlobalLoadingHandler(setLoading);
  }, []);

  return (
    <>
      <Routes>
        <Route element={<RootLayout/>}>
            {publicRoute.map((route, index) => {
          let Page = route.page;
          let Layout = route.layout == null ? Fragment :  route.layout
          
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <Layout>
                  <Page />
                </Layout>
              }
            />
          );
        })}
        </Route>
        
      </Routes>
      <Toaster />
      {loading && <Loading/>}
    </>
  );
}

export default App;
