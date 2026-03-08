
import "../i18n";
import { useTranslation } from "react-i18next"; 
export function LoginView(props) {
    const { t, i18n } = useTranslation();

    
    function log(){props.onChange();}
    
    return (
        <div className="centered-container">
    <div>
    <h1>{t("log")}</h1>
    </div>
    <div><input 

type="text"
value={props.usernameV}
placeholder={t("username")}
onChange={props.doUsername}

/>
<input 

type="password"
value={props.passwordV}
placeholder={t("password")}
onChange={props.doPW}

/></div>
<button onClick={log}>{t("submit")}</button>
    </div>
    );
  }