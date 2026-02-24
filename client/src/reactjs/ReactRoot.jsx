

import {  createHashRouter,  RouterProvider, useParams, Navigate} from "react-router-dom";

import { Start } from "./startPresenter";
import { Register } from "./RegisterPresenter";
import { Login } from "./LoginPresenter";
import { Regorlog } from "./regorlogPresenter";
import { model } from "../EmploymentModel";
import { Apply } from "./applyPresenter";
import { Recruit } from "./recruitPresenter";
import { observer } from "mobx-react-lite";
import { Detailed } from "./detailedPresenter";
import { Recover } from "./recoverPresenter";
import { Recover2 } from "./recover2Presenter";

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
    {
      path: "/det",
      element: <Detailed  model={model}/>,
    },
    {
      path: "/rec1",
      element: <Recover  model={model}/>,
    },
    {
      path: "/__recover",
      element: <Recover2  model={model}/>,
    },
  ]);
}
/*
function ReactRoot() {
  return <RouterProvider router={makeRouter()} />;
}
  */
const ReactRoot = observer(   //  will be added in week 3
   
    
    
  function ReactRoot(){
      
      if(!model.readym){ return (<div><h1>loading...</h1></div>)}//theFunction searchroot
          else{/**/ 
            return <RouterProvider router={makeRouter()} />;
             /**/
          }
                       
}

)

export { ReactRoot };



