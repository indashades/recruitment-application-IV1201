/**
 * View component for step 2 of account recovery (set new password from a recovery link).
 *
 * @param {{
 *   onChange: () => void,
 *   doPW: (event: import("react").ChangeEvent<HTMLInputElement>) => void,
 *   passwordV?: string,
 *   hasToken: boolean,
 *   loading?: boolean,
 *   errorMessage?: string,
 *   successMessage?: string,
 *   onBack: () => void,
 *   onRequestNewLink: () => void
 * }} props
 * @returns {JSX.Element}
 */
export function Recover2View(props) {
    
    function log(e){
      if (e) e.preventDefault();
      props.onChange();
    }
    
    return (
      <div className="auth-shell recovery-shell">
        <div className="auth-card recovery-card">
          <div className="auth-card__header">
            <span className="auth-badge">Secure recovery link</span>
            <h1>Set a new password</h1>
            <p>
              This page reads your recovery token automatically from the link in your email.
              You only need to choose a new password.
            </p>
          </div>

          <div className="auth-card__body">
            {!props.hasToken ? (
              <>
                <div className="auth-alert auth-alert--error" role="alert">
                  This recovery link is incomplete or invalid. Please request a new recovery email.
                </div>
                <div className="auth-actions">
                  <button type="button" className="auth-button" onClick={props.onRequestNewLink}>
                    Request new recovery link
                  </button>
                  <button type="button" className="auth-button auth-button--secondary" onClick={props.onBack}>
                    Back to start
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
                    New password
                  </label>
                  <input
                    id="recovery-password"
                    className="auth-input"
                    type="password"
                    value={props.passwordV || ""}
                    placeholder="At least 8 characters"
                    onChange={props.doPW}
                    autoComplete="new-password"
                    disabled={props.loading}
                  />

                  <button className="auth-button" type="submit" disabled={props.loading}>
                    {props.loading ? "Saving..." : "Save new password"}
                  </button>
                </form>

                <div className="auth-info">
                  <p className="auth-kicker"><strong>Password tips</strong></p>
                  <ul>
                    <li>Use at least 8 characters (longer is better).</li>
                    <li>Avoid reusing old passwords.</li>
                    <li>Use a password manager if possible.</li>
                  </ul>
                </div>

                <hr className="auth-divider" />

                <div className="auth-actions">
                  {props.successMessage ? (
                    <button type="button" className="auth-button" onClick={props.onBack}>
                      Continue to app
                    </button>
                  ) : (
                    <button type="button" className="auth-button auth-button--secondary" onClick={props.onRequestNewLink}>
                      Request a new link
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