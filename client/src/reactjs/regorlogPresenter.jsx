import { RegorlogView } from "../view/RegorlogView";
import { observer } from "mobx-react-lite";

const Regorlog = observer(            
    
    

    function RegorlogRender(model){
        
        function log1() {
                
                window.location.hash = "#/Log";
          }
          function reg1() {
                
            window.location.hash = "#/Reg";
      }
          
        
        
        

        return <RegorlogView   log1={log1} welcome reg1={reg1}  />;
        
    }
);

export { Regorlog };
    