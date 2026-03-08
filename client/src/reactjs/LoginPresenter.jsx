import { LoginView } from "../view/LoginView";
import { observer } from "mobx-react-lite";
import "../i18n";
import { useTranslation } from "react-i18next"; 

const Login = observer(            
    //login with username {string} and password {string}
    

    function LoginRender(model){
        let username=null;
        const { t, i18n } = useTranslation();
        let pw=null;
        function pwa(p){pw=p.target.value;}
        function ura(p){username=p.target.value;}
        async function changeRegOrLog() {
            if(username<3){alert(t("usern3"));}
            else if (pw<8){alert(t("morest"));}
            else{
                if (await model.model.loggaIn(username,pw)==1)
                {
                    alert(t("guh1"));
                }
                if (model.model.loggedin === 1)
                    {
                        alert(t("guh2"));
                        window.location.hash = model.model.wantedPage;
                    }
            }
          }
          
          
        
        
        

        return <LoginView   onChange={changeRegOrLog} doPW={pwa} doUsername={ura}  />;
        
    }
);

export { Login };
    