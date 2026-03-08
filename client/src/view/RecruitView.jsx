import "../i18n";
import { useTranslation } from "react-i18next"; 
export function RecruitView(props) {
    
    const { t, i18n } = useTranslation();
    
   
    function searching(){props.onSearch();}
    
    return (
        <div >
    <div>
    <h1>{t("va")}</h1>
    </div>
    <div><input 

type="text"
value={props.search}
placeholder={t("s")}
onChange={props.p1}

/>
<select name={t("cs")} id="status"  value={props.status}
        onChange={props.p2}>
  <option value="unhandled">{t("any")}</option>
  <option value="accepted">{t("acc")}</option>
  <option value="rejected">{t("rej")}</option>
  <option value="unhandled">{t("unh")}</option>
</select>

{/*test to be removed*/}
<button onClick={searching}>{t("s")}</button>


</div>

<div >
                
                {props.model.applications.map((app, index) => (
                    <div key={index} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}
                    onClick={() => props.p3(app.applicationId)}
                    >
                        <p><strong>{t("id")}</strong> {app.applicationId}</p>
                        <p><strong>{t("nam")}</strong> {app.fullName}</p>
                        <p><strong>{t("stat")}</strong> {app.status}</p>
                        <p><strong>{t("subd")}</strong> {app.submissionDate}</p>
                    </div>
                ))}
            </div>
    </div>
    );
  }