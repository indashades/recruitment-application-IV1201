import { DetailedView } from "../view/DetailedView";
import { observer } from "mobx-react-lite";

const Detailed = observer(            
    //view applicants page takes input status {int} and search {string}
    

    function RecruitRender(model){
        let status=1;
        let search=null;
        function ura(p){status=p.target.value;model.model.setss(status,search);}
          
          
        
        
        

        return <DetailedView     p2={ura} model={model.model}  />;
        
    }
);

export { Detailed};