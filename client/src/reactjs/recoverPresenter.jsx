import { RecoverView } from "../view/RecoverView";
import { observer } from "mobx-react-lite";

const Recover = observer(            
    //login with username {string} and password {string}
    

    function RecoverRender(model){
        let username=null;
        function ura(p){username=p.target.value;}
        async function changeRegOrLog() {
            if(!username || username.length<3){alert("username must contain at least 3 characters");}
            else{
                try{
                await model.model.rec1(username)
                alert("If the account exists, a recovery email has been sent.")
                window.location.hash = "#/Log";
                
                }
                catch{alert("something went wrong")}
            }
          }
          
          
        
        
        

        return <RecoverView   onChange={changeRegOrLog} doUsername={ura}  />;
        
    }
);

export { Recover };
    