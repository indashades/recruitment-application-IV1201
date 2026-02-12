import { LoginView } from "../view/LoginView";
import { observer } from "mobx-react-lite";

const Login = observer(            
    //login with username {string} and password {string}
    

    function LoginRender(model){
        let username=null;
        let pw=null;
        function pwa(p){pw=p.target.value;}
        function ura(p){username=p.target.value;}
        async function changeRegOrLog() {
            if(username<3){alert("username must contain at least 3 characters");}
            else if (pw<8){alert("password must be at least 8 characters");}
            else{
                await model.model.loggaIn(username,pw);
                if (model.model.loggedin === 1)
                    {
                        alert("log in successful");
                        window.location.hash = model.model.wantedPage;
                    }
            }
          }
          
          
        
        
        

        return <LoginView   onChange={changeRegOrLog} doPW={pwa} doUsername={ura}  />;
        
    }
);

export { Login };
    