import { StartView } from "../view/StartView";
import { observer } from "mobx-react-lite";

const Start = observer(            
    
    

    function StartRender(model){//model
        
        function changeRegOrLog() {
                
                window.location.hash = "#/RegOrLog";
          }
          function viewApplicants(){if(model.model.recruiter==0)
            {
                model.model.setWantedPage("#/rec");
                window.location.hash = "#/RegOrLog";
            }
            else{window.location.hash = "#/rec";}
        }
          function apply(){if(model.model.loggedin==0)
            {
                model.model.setWantedPage("#/Appl");
                window.location.hash = "#/RegOrLog";
            }
            else{window.location.hash = "#/Appl";}}
          
        
        
        

        return <StartView /* mayhaps the functions? */   onChange={changeRegOrLog} welcome viewAppl={viewApplicants} apply={apply}  />;
        
    }
);

export { Start };
    