import { RecruitView } from "../view/RecruitView";
import { observer } from "mobx-react-lite";

const Recruit = observer(            
    //view applicants page takes input status {int} and search {string}
    

    function RecruitRender(model){
        let status=null;
        let search=null;
        function pwa(p){search=p.target.value;model.model.setss(status,search);}
        function ura(p){status=p.target.value;model.model.setss(status,search);}
        async function list(a){

            await model.model.get1Application(a);
            console.log("entering application with id: "+a);
            window.location.hash = "#/det";
        }
        async function changeRegOrLog() {
                await model.model.makeApp();
                
                if (model.model.loggedin===1)
                    {
                        
                    }
          }
          async function onSearch(search,status) 
          {
            //model.model.setss(status,search)
            await model.model.onSearch();
            //model.model.setTrue();
          }
          
          
        
        
        

        return <RecruitView   onChange={changeRegOrLog} onSearch={onSearch} p1={pwa} p2={ura} p3={list} model={model.model}  />;
        
    }
);

export { Recruit };