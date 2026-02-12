import { RecruitView } from "../view/RecruitView";
import { observer } from "mobx-react-lite";

const Recruit = observer(            
    
    

    function RecruitRender(model){
        let status=1;
        let search=null;
        function pwa(p){search=p.target.value;}
        function ura(p){status=p.target.value;}
        async function changeRegOrLog() {
                model.model.makeApp();
                if (model.model.loggedin===1)
                    {
                        
                        window.location.hash = "#/";
                        window.location.hash = "#/rec";
                    }
          }
          function onSearch(search,status) 
          {
            model.model.onSearch(search,status);
          }
          
          
        
        
        

        return <RecruitView   onChange={changeRegOrLog} onSearch={onSearch} doPW={pwa} doUsername={ura} model={model.model}  />;
        
    }
);

export { Recruit };