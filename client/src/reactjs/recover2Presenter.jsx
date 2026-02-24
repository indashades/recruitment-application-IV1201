import { Recover2View } from "../view/Recover2View";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";

const Recover2 = observer(            
    //login with username {string} and password {string}
    

    function Recover2Render(model){
        const [searchParams] = useSearchParams();
        const recoveryToken = searchParams.get("token") || "";
        let pw=null;
        function pwa(p){pw=p.target.value;}
        async function changeRegOrLog() {
            if(!recoveryToken){alert("invalid or missing recovery token");}
            else if (!pw || pw.length<8){alert("password must be at least 8 characters");}
            else{
                try{
                await model.model.rec2(recoveryToken,pw)
                
                window.location.hash = "#/";
                }
                catch{alert("recovery link is invalid or expired")}
            }
          }
          
          
        
        
        

        return <Recover2View   onChange={changeRegOrLog} doPW={pwa} />;
        
    }
);

export { Recover2 };
    