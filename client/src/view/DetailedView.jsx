import "../i18n";
import { useTranslation } from "react-i18next"; 

export function DetailedView(props) {
  const { t, i18n } = useTranslation();
    
   
    function searching(){props.onSearch();}
    
    return (
        <div >
    <div class="centered-container2">
    <h1>{t("detail")}</h1>
    </div>
    <div class="centered-container">
        
<select name="choose status" id="status"  value={props.model.application.status}
        onChange={props.p2}>
  <option value="any">{t("any")}</option>
  <option value="accepted">{t("acc")}</option>
  <option value="rejected">{t("rej")}</option>
  <option value="unhandled">{t("unh")}</option>
</select>
</div>

{/*to be displayed is


"application": {
    "applicationId": 10,
    "status": "unhandled",
    "submissionDate": "2026-02-02",
    "version": 1,
    "person": {
      "personId": 1,
      "firstName": "FName",
      "lastName": "LName",
      "email": "email@example.com"
    },
    "competences": [
      {
        "competenceId": 1,
        "code": "JAVA",
        "name": "Java",
        "yearsOfExperience": 5.5
      }
    ],
    "availability": [
      { "fromDate": "2026-01-01", "toDate": "2026-06-30" }
    ]
     */}


  
    <div class="centered-container">
      

      

      {/* BASIC INFO */}
      <h2>{t("api")}</h2>
      <p><strong>{t("id")}</strong> {props.model.application.applicationId}</p>
      <p><strong>{t("subd")}</strong> {props.model.application.submissionDate}</p>
      <p><strong>{t("ver")}</strong> {props.model.application.version}</p>

      {/* PERSON */}
      <h2>{t("person")}</h2>
      <p><strong>{t("fn2")}</strong> {props.model.application.person.firstName}</p>
      <p><strong>{t("ln2")}</strong> {props.model.application.person.lastName}</p>
      <p><strong>{t("maiol")}</strong> {props.model.application.person.email}</p>

      {/* COMPETENCES */}
      <h2>{t("Competences")}</h2>
      {props.model.application.competences.map((comp) => (
        <div key={comp.competenceId}>
          <p><strong>{t("nam")}</strong> {t(comp.name)}</p>
          <p><strong>{t("code")}</strong> {comp.code}</p>
          <p><strong>{t("yoe")}</strong> {comp.yearsOfExperience}</p>
          <hr />
        </div>
      ))}

      {/* AVAILABILITY */}
      <h2>{t("aval")}</h2>
      {props.model.application.availability.map((period, index) => (
        <div key={index}>
          <p><strong>{t("fro")}</strong> {period.fromDate}</p>
          <p><strong>{t("to")}</strong> {period.toDate}</p>
        </div>
      ))}
    </div>
    </div>
  );
}

























