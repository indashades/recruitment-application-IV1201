import { DetailedView } from "../view/DetailedView";
import { observer } from "mobx-react-lite";
import "../i18n";
import { useTranslation } from "react-i18next"; 


const Detailed = observer(            
    //view applicants page takes input status {int} and search {string}
    

    function RecruitRender(model){
        const { t, i18n } = useTranslation();
        let status=model.model.application.status;
        async function ura(p){status=p.target.value;model.model.setsstat();
            const u =await model.model.changeStatus(status);
            if (u==1)
            {
                alert(t("guh4"));
            }
            else if (u==2)
            {
                alert(t("guh5"));
            }
            model.model.setss("unhandled","");
            //model.model.setss(status,search)
            await model.model.onSearch();
            if(model.model.mes.message!=undefined)
            {
            alert(model.model.mes.message);
            }
            window.location.hash = "#/rec";
        }
          
          
        
        
        

        return <DetailedView     p2={ura} model={model.model}  />;
        
    }
);

export { Detailed};