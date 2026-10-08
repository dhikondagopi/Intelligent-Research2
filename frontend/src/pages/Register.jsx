import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Briefcase,
  ChevronDown,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import AuthShell from "../components/auth/AuthShell";
import AuthCard from "../components/auth/AuthCard";
import AuthHeader from "../components/auth/AuthHeader";
import FormField from "../components/auth/FormField";
import PasswordField from "../components/auth/PasswordField";
import { registerUser, loginUser } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();

  // Form states
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "researcher",
    password: "",
    confirmPassword: "",
    adminInviteCode: "",
  });

  // UI & Feedback states
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (apiError) setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = "Full name is required";
    }

    if (!form.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Please enter a valid email address";
    }

    if (!form.role) {
      errs.role = "Please select a role";
    }

    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = "Confirm password is required";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setApiSuccess("");

    if (!validate()) return;

    setLoading(true);

    // SECURITY ENFORCEMENT:
    // If 'admin' was chosen without an invite code, provision as researcher
    let safeRole = form.role;
    if (form.role === "admin" && !form.adminInviteCode.trim()) {
      safeRole = "researcher";
    }

    try {
      // 1. Register account
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: safeRole,
      });

      setApiSuccess("Account created successfully. Authenticating workspace...");

      // 2. Automatically log in to obtain JWT access token
      try {
        await loginUser({
          email: form.email.trim(),
          password: form.password,
        });

        // 3. Redirect to designated dashboard
        setTimeout(() => {
          navigate(`/dashboard/${safeRole}`);
        }, 500);
      } catch (loginErr) {
        console.warn("Auto-login error:", loginErr);
        setTimeout(() => {
          navigate("/login");
        }, 700);
      }
    } catch (error) {
      console.error("Registration error:", error);
      const detail =
        error.response?.data?.detail ||
        "Registration failed. Please check your information and try again.";
      setApiError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell activePage="register">
      <AuthCard>
        <AuthHeader
          heading="Create your account"
          subtitle="Set up your workspace for research intelligence."
        />

        {/* Error alert */}
        {apiError && (
          <div className="auth-alert auth-alert-error" role="alert">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{apiError}</span>
          </div>
        )}

        {/* Success alert */}
        {apiSuccess && (
          <div className="auth-alert auth-alert-success" role="status">
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <span>{apiSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Full Name */}
          <FormField
            id="reg-name"
            name="name"
            label="Full Name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Dr. Eleanor Vance"
            icon={User}
            error={errors.name}
            required
            disabled={loading}
            autoComplete="name"
            autoFocus
          />

          {/* Email */}
          <FormField
            id="reg-email"
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
          />

          {/* Role */}
          <div className="auth-field-group">
            <div className="auth-label-row">
              <label htmlFor="reg-role" className="auth-field-label">
                Role <span className="auth-required-mark" aria-hidden="true">*</span>
              </label>
            </div>

            <div
              className={`auth-select-wrapper ${errors.role ? "has-error" : ""} ${loading ? "is-disabled" : ""}`}
            >
              <div className="auth-select-icon" aria-hidden="true">
                <Briefcase size={16} />
              </div>

              <select
                id="reg-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={loading}
                className="auth-select-input"
              >
                <option value="researcher">Researcher / Academic</option>
                <option value="founder">Startup Founder</option>
                <option value="manager">Innovation Manager</option>
                <option value="admin">Administrator</option>
              </select>

              <div className="auth-select-chevron" aria-hidden="true">
                <ChevronDown size={15} />
              </div>
            </div>

            {errors.role && (
              <div className="auth-error-message" role="alert">
                {errors.role}
              </div>
            )}
          </div>

          {/* Admin invite code if admin selected */}
          {form.role === "admin" && (
            <div className="auth-admin-box">
              <div className="auth-admin-header">
                <ShieldAlert size={15} color="#D9A441" />
                <span className="auth-admin-title">Institutional Verification</span>
              </div>
              <p className="auth-admin-desc">
                Enter an authorization code or proceed to provision standard researcher access.
              </p>
              <input
                type="text"
                name="adminInviteCode"
                value={form.adminInviteCode}
                onChange={handleChange}
                placeholder="Authorization code (optional)"
                disabled={loading}
                className="auth-admin-input"
                aria-label="Institutional Admin Code"
              />
            </div>
          )}

          {/* Password with Visibility Toggle */}
          <PasswordField
            id="reg-password"
            name="password"
            label="Password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
            error={errors.password}
            required
            disabled={loading}
            autoComplete="new-password"
            showStrength={true}
          />

          {/* Confirm Password with Visibility Toggle */}
          <PasswordField
            id="reg-confirm-password"
            name="confirmPassword"
            label="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            error={errors.confirmPassword}
            required
            disabled={loading}
            autoComplete="new-password"
            showStrength={false}
          />

          {/* Create Account button */}
          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="auth-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Sign in link */}
        <div className="auth-switch-row">
          <span className="auth-switch-text">Already have an account?</span>
          <Link to="/login" className="auth-switch-link">
            Sign in
          </Link>
        </div>
      </AuthCard>

      <style>{`
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 4px;
          width: 100%;
        }

        .auth-select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          border-radius: 8px;
          border: 1px solid var(--auth-border);
          background-color: var(--auth-input-bg);
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
        }

        .auth-select-wrapper.has-error {
          border-color: #E05B61;
        }

        .auth-select-wrapper.is-disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-select-icon {
          position: absolute;
          left: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          color: var(--auth-muted);
        }

        .auth-select-chevron {
          position: absolute;
          right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          color: var(--auth-muted);
        }

        .auth-select-input {
          width: 100%;
          height: 40px;
          padding-left: 38px;
          padding-right: 36px;
          background-color: transparent;
          border: none;
          color: var(--auth-text);
          font-size: 14px;
          font-family: inherit;
          outline: none;
          border-radius: 8px;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
        }

        .auth-select-input option {
          background-color: var(--auth-card);
          color: var(--auth-text);
        }

        .auth-admin-box {
          background-color: rgba(217, 164, 65, 0.08);
          border: 1px solid rgba(217, 164, 65, 0.25);
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .auth-admin-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .auth-admin-title {
          font-size: 12px;
          font-weight: 600;
          color: #D9A441;
        }

        .auth-admin-desc {
          font-size: 11.5px;
          color: var(--auth-muted);
          line-height: 1.35;
          margin: 0;
        }

        .auth-admin-input {
          width: 100%;
          height: 34px;
          padding: 0 10px;
          background-color: var(--auth-card);
          border: 1px solid var(--auth-border);
          border-radius: 6px;
          color: var(--auth-text);
          font-size: 12.5px;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
        }

        .auth-admin-input:focus {
          border-color: #D9A441;
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