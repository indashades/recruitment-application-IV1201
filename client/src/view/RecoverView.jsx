<<<<<<< Updated upstream
/**
 * View component for step 1 of account recovery (request recovery link).
 *
 * @param {{
 *   onChange: () => void,
 *   doUsername: (event: import("react").ChangeEvent<HTMLInputElement>) => void,
 *   usernameV?: string,
 *   loading?: boolean,
 *   errorMessage?: string,
 *   successMessage?: string,
 *   onBack: () => void
 * }} props
 * @returns {JSX.Element}
 */

=======
import "../i18n";
import { useTranslation } from "react-i18next"; 
>>>>>>> Stashed changes
export function RecoverView(props) {
  const { t, i18n } = useTranslation();
    
    function log(e){
      if (e) e.preventDefault();
      props.onChange();
    }
    
    return (
      <div className="auth-shell recovery-shell">
        <div className="auth-card recovery-card">
          <div className="auth-card__header">
            <span className="auth-badge">{t("ac")}</span>
            <h1>{t("ryp")}</h1>
            <p>
              {t("rl2")}
            </p>
          </div>

          <div className="auth-card__body">
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
              <label className="auth-label" htmlFor="recovery-identifier">
                {t("uoe")}
              </label>
              <input
                id="recovery-identifier"
                className="auth-input"
                type="text"
                value={props.usernameV || ""}
                placeholder={t("uoe")}
                onChange={props.doUsername}
                autoComplete="username"
                disabled={props.loading}
              />

              <button className="auth-button" type="submit" disabled={props.loading}>
                {props.loading ? t("sending") : t("rl3")}
              </button>
            </form>

            <div className="auth-info">
              <p className="auth-kicker"><strong>What happens next?</strong></p>
              <ul>
                <li>{t("li1")}</li>
                <li>{t("li2")}</li>
                <li>{t("li3")}</li>
              </ul>
            </div>

            <div className="auth-actions">
              <button type="button" className="auth-button auth-button--secondary" onClick={props.onBack}>
                {t("li4")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }