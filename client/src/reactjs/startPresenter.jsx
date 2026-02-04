import { StartView } from "../view/StartView";
import { observer } from "mobx-react-lite";

const Start = observer(            
    
    

    function StartRender(model){//model
        
        function changeRegOrLog() {
                
                window.location.hash = "#/RegOrLog";
          }
          function viewApplicants(){/*nothing yet*/}//should go to regorlog if not logged in then to wanted page
          function apply(){/*nothing yet*/}
          
        
        
        

        return <StartView /* mayhaps the functions? */   onChange={changeRegOrLog} welcome viewAppl={viewApplicants} apply={apply}  />;
        
    }
);

export { Start };
    