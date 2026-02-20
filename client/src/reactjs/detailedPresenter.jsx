import { DetailedView } from "../view/DetailedView";
import { observer } from "mobx-react-lite";

const Detailed = observer(            
    //view applicants page takes input status {int} and search {string}
    

    function RecruitRender(model){
        let status=model.model.application.status;
        async function ura(p){status=p.target.value;model.model.setsstat();
            await model.model.changeStatus(status);
            model.model.setss("unhandled","");
            //model.model.setss(status,search)
            await model.model.onSearch();
            window.location.hash = "#/rec";
        }
          
          
        
        
        

        return <DetailedView     p2={ura} model={model.model}  />;
        
    }
);

export { Detailed};