import "../i18n";
import { useTranslation } from "react-i18next"; 
export function Recover2View(props) {
  const { t, i18n } = useTranslation();
    
    function log(e){
      if (e) e.preventDefault();
      props.onChange();
    }
    
    return (
      <div className="auth-shell recovery-shell">
        <div className="auth-card recovery-card">
          <div className="auth-card__header">
            <span className="auth-badge">{t("secrec")}</span>
            <h1>{t("newpw")}</h1>
            <p>
              {t("rectok")}
            </p>
          </div>

          <div className="auth-card__body">
            {!props.hasToken ? (
              <>
                <div className="auth-alert auth-alert--error" role="alert">
                  {t("invtok")}
                </div>
                <div className="auth-actions">
                  <button type="button" className="auth-button" onClick={props.onRequestNewLink}>
                    {t("recnew")}
                  </button>
                  <button type="button" className="auth-button auth-button--secondary" onClick={props.onBack}>
                    {t("bts")}
                  </button>
                </div>
              </>
            ) : (
              <>
                {props.errorMessage ? (
                  <div className="auth-alert auth-alert--error" role="alert">
                    {props.errorMessage}
                  </div>
                ) : null}

                {props.successMessage ? (
                  <div className="auth-alert auth-alert--success" role="status">
                    {props.successMessage}
                  </div>
                ) : null}

                <form className="auth-form" onSubmit={log}>
                  <label className="auth-label" htmlFor="recovery-password">
                    {t("newpw2")}
                  </label>
                  <input
                    id="recovery-password"
                    className="auth-input"
                    type="password"
                    value={props.passwordV || ""}
                    placeholder={t("nu")}
                    onChange={props.doPW}
                    autoComplete="new-password"
                    disabled={props.loading}
                  />

                  <button className="auth-button" type="submit" disabled={props.loading}>
                    {props.loading ? t("save") : t("pas")}
                  </button>
                </form>

                <div className="auth-info">
                  <p className="auth-kicker"><strong>{t("ptip")}</strong></p>
                  <ul>
                    <li>{t("liv1")}</li>
                    <li>{t("liv2")}</li>
                    <li>{t("liv3")}</li>
                  </ul>
                </div>

                <hr className="auth-divider" />

                <div className="auth-actions">
                  {props.successMessage ? (
                    <button type="button" className="auth-button" onClick={props.onBack}>
                      {t("contoap")}
                    </button>
                  ) : (
                    <button type="button" className="auth-button auth-button--secondary" onClick={props.onRequestNewLink}>
                      {t("recnel")}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }