export function RecoverView(props) {
    
    function log(e){
      if (e) e.preventDefault();
      props.onChange();
    }
    
    return (
      <div className="auth-shell recovery-shell">
        <div className="auth-card recovery-card">
          <div className="auth-card__header">
            <span className="auth-badge">Account recovery</span>
            <h1>Reset your password</h1>
            <p>
              Enter your username or email address and we&apos;ll send a secure
              password reset link.
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
                Username or email
              </label>
              <input
                id="recovery-identifier"
                className="auth-input"
                type="text"
                value={props.usernameV || ""}
                placeholder="your.username or name@example.com"
                onChange={props.doUsername}
                autoComplete="username"
                disabled={props.loading}
              />

              <button className="auth-button" type="submit" disabled={props.loading}>
                {props.loading ? "Sending..." : "Send recovery link"}
              </button>
            </form>

            <div className="auth-info">
              <p className="auth-kicker"><strong>What happens next?</strong></p>
              <ul>
                <li>We send a secure link to the email address connected to the account.</li>
                <li>For privacy, the same success message is shown whether or not the account exists.</li>
                <li>If you don&apos;t see the email, check your spam/junk folder.</li>
              </ul>
            </div>

            <div className="auth-actions">
              <button type="button" className="auth-button auth-button--secondary" onClick={props.onBack}>
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }