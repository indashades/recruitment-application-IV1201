// ReactRoot.jsx

import {  createHashRouter,  RouterProvider, useParams, Navigate} from "react-router-dom";

import { Start } from "./startPresenter";
import { Register } from "./RegisterPresenter";
import { Login } from "./LoginPresenter";
import { Regorlog } from "./regorlogPresenter";
import { model } from "../EmploymentModel";
import { Apply } from "./applyPresenter";
import { Recruit } from "./recruitPresenter";

function makeRouter() {
  return createHashRouter([
    {
      path: "/",
      element: <Start model={model}/>,
    },
    {
      path: "/Reg",
      element: <Register model={model} />,
    },
    {
      path: "/Log",
      element: <Login  model={model}/>,
    },
    {
      path: "/RegOrLog",
      element: <Regorlog  model={model}/>,
    },
    {
      path: "/Appl",
      element: <Apply  model={model}/>,
    },
    {
      path: "/rec",
      element: <Recruit  model={model}/>,
    },
  ]);
}

function ReactRoot() {
  return <RouterProvider router={makeRouter()} />;
}

export { ReactRoot };


