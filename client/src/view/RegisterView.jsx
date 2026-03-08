import "../i18n";
import { useTranslation } from "react-i18next"; 
export function RegisterView(props) {
    const { t, i18n } = useTranslation();
    
    function regg()
    {
        props.onChange();
        
    }
    
    
    return (
        <div className="centered-container">
    <div>
    <h1>{t("reg")}</h1>
    </div>
    <div><input 

type="text"
value={props.username}
placeholder={t("username")}
onChange={props.usernamea}

/>
<input 

type="password"
value={props.pw}
placeholder={t("Password")}
onChange={props.pwa}

/></div>
<div><input 

type="text"
value={props.mail}
placeholder={t("mail")}
onChange={props.maila}

/>
<input 

type="text"
value={props.name1}
placeholder={t("fn")}
onChange={props.name1a}

/>
<input 

type="text"
value={props.name2}
placeholder={t("ln")}
onChange={props.name2a}

/></div>
<div>
<input 

type="text"
value={props.pnr}
placeholder={t("pnr")}
onChange={props.pnra}

/>
</div>
<button onClick={regg}>{t("submit")}</button>
    </div>
    );
  }