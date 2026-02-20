import { Recover2View } from "../view/Recover2View";
import { observer } from "mobx-react-lite";

const Recover2 = observer(            
    //login with username {string} and password {string}
    

    function Recover2Render(model){
        let username=null;
        let pw=null;
        function pwa(p){pw=p.target.value;}
        function ura(p){username=p.target.value;}
        async function changeRegOrLog() {
            if(username<3){alert("token must contain at least 1 character");}
            else if (pw<8){alert("password must be at least 8 characters");}
            else{
                try{
                await model.model.rec2(username,pw)
                
                window.location.hash = "#/";
                }
                catch{alert("something went wrong")}
            }
          }
          
          
        
        
        

        return <Recover2View   onChange={changeRegOrLog} doPW={pwa} doUsername={ura}  />;
        
    }
);

export { Recover2 };
    