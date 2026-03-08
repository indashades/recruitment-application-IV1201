import "../i18n";
import { useTranslation } from "react-i18next";

export function DetailedView(props) {
  const { t } = useTranslation();

  const application =
    props.application ??
    props.model?.selectedApplication ??
    props.model?.application ??
    null;

  if (!application) {
    return (
      <div className="centered-container">
        <h1>{t("detail")}</h1>
        <p>No application selected.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="centered-container2">
        <h1>{t("detail")}</h1>
      </div>

      <div className="centered-container">
        <select
          name="choose status"
          id="status"
          value={application.status}
          onChange={props.p2}
        >
          <option value="any">{t("any")}</option>
          <option value="accepted">{t("acc")}</option>
          <option value="rejected">{t("rej")}</option>
          <option value="unhandled">{t("unh")}</option>
        </select>
      </div>

      <div className="centered-container">
        <h2>{t("api")}</h2>
        <p><strong>{t("id")}</strong> {application.applicationId}</p>
        <p><strong>{t("subd")}</strong> {application.submissionDate}</p>
        <p><strong>{t("ver")}</strong> {application.version}</p>

        <h2>{t("person")}</h2>
        <p><strong>{t("fn2")}</strong> {application.person?.firstName}</p>
        <p><strong>{t("ln2")}</strong> {application.person?.lastName}</p>
        <p><strong>{t("maiol")}</strong> {application.person?.email}</p>

        <h2>{t("Competences")}</h2>
        {(application.competences ?? []).map((comp) => (
          <div key={comp.competenceId}>
            <p><strong>{t("nam")}</strong> {t(comp.name)}</p>
            <p><strong>{t("code")}</strong> {comp.code}</p>
            <p><strong>{t("yoe")}</strong> {comp.yearsOfExperience}</p>
            <hr />
          </div>
        ))}

        <h2>{t("aval")}</h2>
        {(application.availability ?? []).map((period, index) => (
          <div key={index}>
            <p><strong>{t("fro")}</strong> {period.fromDate}</p>
            <p><strong>{t("to")}</strong> {period.toDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
}