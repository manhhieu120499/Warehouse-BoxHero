import React, { Fragment } from "react";
import { Routes, Route } from "react-router-dom";
import { publicRoute } from "./routes";
import DefaultLayout from "./layouts/DefaultLayout";
import {Toaster} from "react-hot-toast";

function App() {
  return (
    <>
      <Routes>
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
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
