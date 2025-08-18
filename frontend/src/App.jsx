import React, { Fragment, useEffect } from "react";
import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import { publicRoute } from "./routes";
import DefaultLayout from "./layouts/DefaultLayout";
import {Toaster} from "react-hot-toast";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { post } from "./utils/httpRequest";
import EmployeeDTO from "./dtos/EmployeeDTO";
import { login } from "./lib/redux/auth/authSlice";

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
                        employeeID,
                    },
                    accessToken,
                );
                const {employee} = responseUser
                dispatch(login({ ...new EmployeeDTO({ ...employee, roles }) }));
            } catch (err) {
                console.log(err);
            }
        };
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
    </>
  );
}

export default App;
