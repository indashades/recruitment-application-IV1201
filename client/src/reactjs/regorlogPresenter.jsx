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
      function rec1() {
                
        window.location.hash = "#/Rec1";
  }
          
        
        
        

        return <RegorlogView   log1={log1} welcome reg1={reg1} rec1={rec1} />;
        
    }
);

export { Regorlog };
    