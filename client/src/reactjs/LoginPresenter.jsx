import { LoginView } from "../view/LoginView";
import { observer } from "mobx-react-lite";

const Login = observer(            
    
    

    function LoginRender(model){//model
        let username=null;
        let pw=null;
        function pwa(p){pw=p.target.value;}
        function ura(p){username=p.target.value;}
        async function changeRegOrLog() {
                await model.model.loggaIn(username,pw);
                if (model.model.loggedin === 1)
                    {
                        alert("log in successful");
                        window.location.hash = model.model.wantedPage;
                    }
          }
          
          
        
        
        

        return <LoginView /* mayhaps the functions? */   onChange={changeRegOrLog} doPW={pwa} doUsername={ura}  />;
        
    }
);

export { Login };
    