import { RecruitView } from "../view/RecruitView";
import { observer } from "mobx-react-lite";

const Recruit = observer(            
    
    

    function RecruitRender(model){//model
        let status=1;
        let search=null;
        function pwa(p){search=p.target.value;}
        function ura(p){status=p.target.value;}
        function changeRegOrLog() {
                model.model.makeApp();
                if (model.model.loggedin==0)//ändra till 1
                    {
                        //do stuff
                        window.location.hash = "#/";
                        window.location.hash = "#/rec";
                    }
          }
          function onSearch(search,status) 
          {
            model.model.onSearch(search,status);
          }
          
          
        
        
        

        return <RecruitView /* mayhaps the functions? */   onChange={changeRegOrLog} onSearch={onSearch} doPW={pwa} doUsername={ura} model={model.model}  />;
        
    }
);

export { Recruit };