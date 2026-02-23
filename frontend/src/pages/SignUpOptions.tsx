import { Link } from "react-router-dom";

export function SignUpOptions() {
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="auth-layout">
        <div className="auth-card">
          <h1 className="auth-heading">Create account</h1>
          <p className="auth-sub">One account. Your trips. Your crew.</p>

          <Link to="/signup/email">
            <button type="button" className="btn btn-secondary">
              Sign up with email
            </button>
          </Link>

          <p className="link-row" style={{ marginTop: 24 }}>
            Been here before? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
