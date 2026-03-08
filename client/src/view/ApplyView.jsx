
import "../i18n";
import { useTranslation } from "react-i18next"; 
export function ApplyView(props) {
  const { t, i18n } = useTranslation();
    
    function log(){props.onChange();}
    function can(){props.onChange2();}

    
    return (
        <div class="centered-container">
    <div>
    <h1>{t("applyf")}</h1>
    </div>
    <div><input 

type="text"
value={props.avalablefrom}
placeholder={t("avfrom")}
onChange={props.doPW}

/>
<input 

type="text"
value={props.avalableto}
placeholder={t("avto")}
onChange={props.doUsername}

/></div>


<div className="wider">
  <h4>{t("exp1")}</h4>
<input 
type="text"
value={props.yearsTicket}
placeholder={t("exp1")}
onChange={props.appl1}
/></div>
<div className="wider">
  <h4>{t("exp3")}</h4>
<input 
type="text"
value={props.yearsLotteries}
placeholder={t("exp4")}
onChange={props.appl2}
/></div>
<div className="wider">
  <h4>{t("exp5")}</h4>
<input 
type="text"
value={props.yearsRoller}
placeholder={t("exp5")}
onChange={props.appl3}
/></div>
<div>
<button onClick={can}>{t("cancel")}</button>
<button onClick={log}>{t("submit")}</button>
</div>
    </div>
    );
  }