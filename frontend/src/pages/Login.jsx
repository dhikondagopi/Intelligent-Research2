import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import AuthShell from "../components/auth/AuthShell";
import AuthCard from "../components/auth/AuthCard";
import AuthHeader from "../components/auth/AuthHeader";
import FormField from "../components/auth/FormField";
import PasswordField from "../components/auth/PasswordField";
import { loginUser } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();

  // Form states
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // UI & Feedback states
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password flow
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState({ loading: false, message: "", isSuccess: false });

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Please enter a valid email address";
    }

    if (!form.password) {
      errs.password = "Password is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setApiSuccess("");

    if (!validate()) return;

    setLoading(true);

    try {
      const data = await loginUser(form);
      const role = data.role || "researcher";

      setApiSuccess("Authentication verified. Loading workspace...");

      setTimeout(() => {
        navigate(`/dashboard/${role}`);
      }, 500);
    } catch (error) {
      console.error("Login failed:", error);
      const detail =
        error.response?.data?.detail ||
        (error.response?.status === 401
          ? "Invalid email or password. Please verify your credentials."
          : "Unable to connect to authentication server. Please try again.");
      setApiError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotStatus({
        loading: false,
        message: "Please enter a valid email address",
        isSuccess: false,
      });
      return;
    }

    setForgotStatus({ loading: true, message: "", isSuccess: false });
    setTimeout(() => {
      setForgotStatus({
        loading: false,
        message: `Password reset instructions have been dispatched to ${forgotEmail}. Please check your inbox.`,
        isSuccess: true,
      });
    }, 600);
  };

  return (
    <AuthShell activePage="login">
      <AuthCard>
        {!showForgotModal ? (
          <>
            <AuthHeader
              heading="Welcome back"
              subtitle="Sign in to your research intelligence workspace."
            />

            {/* Error feedback alert */}
            {apiError && (
              <div className="auth-alert auth-alert-error" role="alert">
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{apiError}</span>
              </div>
            )}

            {/* Success feedback alert */}
            {apiSuccess && (
              <div className="auth-alert auth-alert-success" role="status">
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{apiSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {/* Email Address */}
              <FormField
                id="login-email"
                name="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@institution.edu"
                icon={Mail}
                error={errors.email}
                required
                disabled={loading}
                autoComplete="email"
                autoFocus
              />

              {/* Password with Visibility Toggle */}
              <PasswordField
                id="login-password"
                name="password"
                label="Password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
                required
                disabled={loading}
                autoComplete="current-password"
                forgotPasswordAction={
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(form.email || "");
                      setForgotStatus({ loading: false, message: "", isSuccess: false });
                      setShowForgotModal(true);
                    }}
                    className="auth-forgot-link"
                  >
                    Forgot password?
                  </button>
                }
              />

              {/* Sign In button */}
              <button
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? (
                  <>
                    <RefreshCw size={15} className="auth-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Create account link */}
            <div className="auth-switch-row">
              <span className="auth-switch-text">Don't have an account?</span>
              <Link to="/register" className="auth-switch-link">
                Create account
              </Link>
            </div>
          </>
        ) : (
          /* Minimal Reset Password View */
          <div className="auth-forgot-view">
            <div className="auth-forgot-header">
              <div className="auth-forgot-icon-box">
                <KeyRound size={20} color="#4C8DFF" />
              </div>
              <h2 className="auth-card-title" style={{ marginTop: 8 }}>Reset Password</h2>
              <p className="auth-card-subtitle">
                Enter your registered workspace email and we'll dispatch password recovery instructions.
              </p>
            </div>

            {forgotStatus.message && (
              <div
                className={`auth-alert ${forgotStatus.isSuccess ? "auth-alert-success" : "auth-alert-error"}`}
                role="status"
              >
                {forgotStatus.isSuccess ? (
                  <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                ) : (
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                )}
                <span>{forgotStatus.message}</span>
              </div>
            )}

            {!forgotStatus.isSuccess ? (
              <form onSubmit={handleForgotPasswordSubmit} className="auth-form">
                <FormField
                  id="forgot-email"
                  name="email"
                  label="Registered email address"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  icon={Mail}
                  required
                  disabled={forgotStatus.loading}
                  autoComplete="email"
                  autoFocus
                />

                <div className="auth-forgot-actions">
                  <button
                    type="submit"
                    disabled={forgotStatus.loading}
                    className="auth-submit-btn"
                  >
                    {forgotStatus.loading ? "Sending link..." : "Send Reset Link"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="auth-cancel-btn"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="auth-submit-btn"
                style={{ marginTop: 12 }}
              >
                Back to Sign In
              </button>
            )}
          </div>
        )}
      </AuthCard>

      <style>{`
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 4px;
          width: 100%;
        }

        .auth-forgot-link {
          background: none;
          border: none;
          color: var(--auth-primary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          text-decoration: none;
          font-family: inherit;
        }

        .auth-forgot-link:hover {
          text-decoration: underline;
        }

        .auth-submit-btn {
          width: 100%;
          height: 42px;
          border-radius: 8px;
          border: none;
          background-color: var(--auth-primary);
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background-color 0.18s ease, transform 0.1s ease;
          box-shadow: 0 2px 10px rgba(76, 141, 255, 0.25);
          margin-top: 6px;
          cursor: pointer;
          font-family: inherit;
        }

        .auth-submit-btn:hover:not(:disabled) {
          background-color: #3B7BE6;
          transform: translateY(-1px);
        }

        .auth-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .auth-switch-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid var(--auth-border);
          font-size: 13px;
        }

        .auth-switch-text {
          color: var(--auth-muted);
        }

        .auth-switch-link {
          color: var(--auth-primary);
          font-weight: 600;
          text-decoration: none;
        }

        .auth-switch-link:hover {
          text-decoration: underline;
        }

        .auth-alert {
          border-radius: 8px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          margin-bottom: 16px;
          box-sizing: border-box;
        }

        .auth-alert-error {
          background-color: var(--auth-alert-error-bg);
          border: 1px solid var(--auth-alert-error-border);
          color: var(--auth-alert-error-text);
        }

        .auth-alert-success {
          background-color: var(--auth-alert-success-bg);
          border: 1px solid var(--auth-alert-success-border);
          color: var(--auth-alert-success-text);
        }

        .auth-forgot-view {
          display: flex;
          flex-direction: column;
        }

        .auth-forgot-header {
          text-align: center;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .auth-forgot-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background-color: rgba(76, 141, 255, 0.1);
          border: 1px solid rgba(76, 141, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-forgot-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .auth-cancel-btn {
          width: 100%;
          height: 38px;
          background-color: transparent;
          border: 1px solid var(--auth-border);
          border-radius: 8px;
          color: var(--auth-muted);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s ease;
        }

        .auth-cancel-btn:hover {
          color: var(--auth-text);
          border-color: var(--auth-muted);
        }

        .auth-spin {
          animation: authSpin 1s linear infinite;
        }

        @keyframes authSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AuthShell>
  );
}
