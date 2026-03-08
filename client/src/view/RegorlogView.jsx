import "../i18n";
import { useTranslation } from "react-i18next"; 
export function RegorlogView(props) {
    const { t, i18n } = useTranslation();
    
    function log(){props.log1();}
    function reg(){props.reg1();}
    function rec(){props.rec1();}
    
    return (
        <div class="centered-container">
    <div>
    <h1>{t("rl")}</h1>
    </div>
    <div><button style={{marginRight: 20}} onClick={log}>{t("log")}</button>
    <button style={{marginRight: 20}} onClick={reg}>{t("reg")}</button>
    <button style={{marginRight: 20}} onClick={rec}>{t("rec")}</button></div>
    </div>
    );
  }