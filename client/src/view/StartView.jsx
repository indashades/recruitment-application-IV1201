import "../i18n";
import { useTranslation } from "react-i18next"; 
export function StartView(props) {
    const { t, i18n } = useTranslation();
    
    function logreg(){props.onChange();}
    function vi(){props.viewAppl();}
    function appl(){props.apply();}
    
    return (
        <div class="centered-container">
    <div>
    <h1>{t("welcome")}</h1>
    </div>
    <div><button style={{marginRight: 20}} onClick={logreg}>{t("rl")}</button></div>
    <div><button style={{marginRight: 20}} onClick={vi}>{t("va")}</button></div>
    <div><button style={{marginRight: 20}} onClick={appl}>{t("appl")}</button></div>
    </div>
    );
  }