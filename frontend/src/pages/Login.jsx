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

  // Forgot password view toggle
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

      setApiSuccess("Authentication verified. Loading your workspace...");

      // Short delay for visual feedback before navigation
      setTimeout(() => {
        navigate(`/dashboard/${role}`);
      }, 600);
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
    // Simulate secure recovery request
    setTimeout(() => {
      setForgotStatus({
        loading: false,
        message: `Password reset instructions have been dispatched to ${forgotEmail}. Please check your inbox.`,
        isSuccess: true,
      });
    }, 800);
  };

  return (
    <AuthShell activePage="login">
      <AuthCard>
        {!showForgotModal ? (
          <>
            <AuthHeader
              badge="Secure Workspace Access"
              heading="Welcome back"
              subtitle="Sign in to continue to your research intelligence workspace."
            />

            {/* API Error Alert */}
            {apiError && (
              <div style={styles.alertError} role="alert">
                <AlertCircle size={16} color="#E05B61" style={{ flexShrink: 0 }} />
                <span>{apiError}</span>
              </div>
            )}

            {/* API Success Alert */}
            {apiSuccess && (
              <div style={styles.alertSuccess} role="status">
                <CheckCircle2 size={16} color="#35C98A" style={{ flexShrink: 0 }} />
                <span>{apiSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form} noValidate>
              {/* Email Address */}
              <FormField
                id="login-email"
                name="email"
                label="Email address"
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

              {/* Password */}
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
                    style={styles.forgotBtn}
                  >
                    Forgot password?
                  </button>
                }
              />

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  opacity: loading ? 0.75 : 1,
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={15} className="auth-spin" style={{ marginRight: 8 }} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to workspace</span>
                    <ArrowRight size={15} style={{ marginLeft: 6 }} />
                  </>
                )}
              </button>
            </form>

            {/* Secondary CTA */}
            <div style={styles.secondaryRow}>
              <span style={styles.secondaryText}>Don't have an account?</span>
              <Link to="/register" style={styles.secondaryLink}>
                Create an account
              </Link>
            </div>
          </>
        ) : (
          /* Forgot Password View */
          <div>
            <div style={styles.forgotHeader}>
              <div style={styles.forgotIconBox}>
                <KeyRound size={20} color="#4C8DFF" />
              </div>
              <h2 style={styles.forgotTitle}>Reset Password</h2>
              <p style={styles.forgotSubtitle}>
                Enter your registered workspace email and we'll send an authentication recovery link.
              </p>
            </div>

            {forgotStatus.message && (
              <div
                style={
                  forgotStatus.isSuccess ? styles.alertSuccess : styles.alertError
                }
                role="status"
              >
                {forgotStatus.isSuccess ? (
                  <CheckCircle2 size={16} color="#35C98A" style={{ flexShrink: 0 }} />
                ) : (
                  <AlertCircle size={16} color="#E05B61" style={{ flexShrink: 0 }} />
                )}
                <span>{forgotStatus.message}</span>
              </div>
            )}

            {!forgotStatus.isSuccess ? (
              <form onSubmit={handleForgotPasswordSubmit} style={styles.form}>
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

                <div style={styles.forgotActionRow}>
                  <button
                    type="submit"
                    disabled={forgotStatus.loading}
                    style={{
                      ...styles.submitButton,
                      opacity: forgotStatus.loading ? 0.75 : 1,
                    }}
                  >
                    {forgotStatus.loading ? "Sending link..." : "Send Reset Link"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    style={styles.cancelBtn}
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={styles.submitButton}
              >
                Back to Sign In
              </button>
            )}
          </div>
        )}
      </AuthCard>

      <style>{`
        .auth-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </AuthShell>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    marginTop: "6px",
  },
  forgotBtn: {
    background: "none",
    border: "none",
    color: "#4C8DFF",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    padding: 0,
    textDecoration: "none",
  },
  submitButton: {
    width: "100%",
    height: "42px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4C8DFF",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.18s ease",
    boxShadow: "0 2px 10px rgba(76, 141, 255, 0.3)",
    marginTop: "6px",
  },
  secondaryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    marginTop: "24px",
    paddingTop: "18px",
    borderTop: "1px solid #202A38",
    fontSize: "13px",
  },
  secondaryText: {
    color: "#98A4B5",
  },
  secondaryLink: {
    color: "#4C8DFF",
    fontWeight: "600",
    textDecoration: "none",
  },
  alertError: {
    backgroundColor: "rgba(224, 91, 97, 0.1)",
    border: "1px solid rgba(224, 91, 97, 0.3)",
    borderRadius: "8px",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "#F2F5F8",
    marginBottom: "16px",
  },
  alertSuccess: {
    backgroundColor: "rgba(53, 201, 138, 0.1)",
    border: "1px solid rgba(53, 201, 138, 0.3)",
    borderRadius: "8px",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "#F2F5F8",
    marginBottom: "16px",
  },
  forgotHeader: {
    textAlign: "center",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  forgotIconBox: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    backgroundColor: "rgba(76, 141, 255, 0.1)",
    border: "1px solid rgba(76, 141, 255, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  forgotTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#F2F5F8",
    margin: 0,
  },
  forgotSubtitle: {
    fontSize: "13px",
    color: "#98A4B5",
    lineHeight: 1.45,
    margin: 0,
  },
  forgotActionRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  cancelBtn: {
    width: "100%",
    height: "38px",
    backgroundColor: "transparent",
    border: "1px solid #202A38",
    borderRadius: "8px",
    color: "#98A4B5",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
};
