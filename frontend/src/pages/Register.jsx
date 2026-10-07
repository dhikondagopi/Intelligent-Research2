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
    // Backend remains authoritative. If 'admin' was chosen without an invite code,
    // provision account as researcher to prevent unauthenticated client-side privilege escalation.
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
        }, 600);
      } catch (loginErr) {
        console.warn("Auto-login error:", loginErr);
        setTimeout(() => {
          navigate("/login");
        }, 800);
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
          subtitle="Set up your workspace for research, funding, and patent intelligence."
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
          <div style={styles.fieldContainer}>
            <div style={styles.labelRow}>
              <label htmlFor="reg-role" style={styles.label}>
                Role <span style={styles.requiredMark} aria-hidden="true">*</span>
              </label>
            </div>

            <div
              style={{
                ...styles.selectWrapper,
                borderColor: errors.role ? "#E05B61" : "#202A38",
                backgroundColor: loading ? "#0B0F17" : "#151D29",
                opacity: loading ? 0.65 : 1,
              }}
            >
              <div style={styles.selectIconBox} aria-hidden="true">
                <Briefcase size={16} color={errors.role ? "#E05B61" : "#98A4B5"} />
              </div>

              <select
                id="reg-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={loading}
                style={styles.selectInput}
              >
                <option value="researcher">Researcher / Academic</option>
                <option value="founder">Startup Founder</option>
                <option value="manager">Innovation Manager</option>
                <option value="admin">Administrator</option>
              </select>

              <div style={styles.selectChevronBox} aria-hidden="true">
                <ChevronDown size={16} color="#98A4B5" />
              </div>
            </div>

            <div style={styles.roleHint}>
              {form.role === "researcher" && "Scholarly publications, literature velocity, grant tracking & citations."}
              {form.role === "founder" && "Patent defensibility, IP landscape, venture capital & market readiness."}
              {form.role === "manager" && "TRL portfolio maturity, institutional research pipelines & commercialization."}
              {form.role === "admin" && "Institutional governance, audit logging, API controls & user management."}
            </div>

            {errors.role && (
              <div style={styles.errorMessage} role="alert">
                {errors.role}
              </div>
            )}
          </div>

          {/* Conditional Admin Invite Code */}
          {form.role === "admin" && (
            <div style={styles.adminBox}>
              <div style={styles.adminHeader}>
                <ShieldAlert size={15} color="#D9A441" />
                <span style={styles.adminTitle}>Institutional Verification</span>
              </div>
              <p style={styles.adminDesc}>
                Enter your institutional authorization code below, or continue to provision standard researcher access.
              </p>
              <input
                type="text"
                name="adminInviteCode"
                value={form.adminInviteCode}
                onChange={handleChange}
                placeholder="Authorization code (optional)"
                disabled={loading}
                style={styles.adminInput}
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
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="auth-spin" style={{ marginRight: 8 }} />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={15} style={{ marginLeft: 6 }} />
              </>
            )}
          </button>
        </form>

        {/* Already have an account? Sign in */}
        <div style={styles.secondaryRow}>
          <span style={styles.secondaryText}>Already have an account?</span>
          <Link to="/login" style={styles.secondaryLink}>
            Sign in
          </Link>
        </div>
      </AuthCard>

      <style>{`
        .auth-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AuthShell>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "6px",
    width: "100%",
  },
  fieldContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#F2F5F8",
    display: "flex",
    alignItems: "center",
    gap: "3px",
  },
  requiredMark: {
    color: "#E05B61",
    fontSize: "14px",
  },
  selectWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease",
  },
  selectIconBox: {
    position: "absolute",
    left: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    zIndex: 1,
  },
  selectChevronBox: {
    position: "absolute",
    right: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    zIndex: 1,
  },
  selectInput: {
    width: "100%",
    height: "40px",
    paddingLeft: "38px",
    paddingRight: "36px",
    backgroundColor: "transparent",
    border: "none",
    color: "#F2F5F8",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    borderRadius: "8px",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  },
  roleHint: {
    fontSize: "12px",
    color: "#98A4B5",
    lineHeight: 1.35,
    marginTop: "2px",
  },
  errorMessage: {
    fontSize: "12px",
    color: "#E05B61",
    lineHeight: 1.3,
  },
  adminBox: {
    backgroundColor: "rgba(217, 164, 65, 0.08)",
    border: "1px solid rgba(217, 164, 65, 0.25)",
    borderRadius: "8px",
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  adminHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  adminTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#D9A441",
  },
  adminDesc: {
    fontSize: "11.5px",
    color: "#98A4B5",
    lineHeight: 1.35,
    margin: 0,
  },
  adminInput: {
    width: "100%",
    height: "34px",
    padding: "0 10px",
    backgroundColor: "#101620",
    border: "1px solid #202A38",
    borderRadius: "6px",
    color: "#F2F5F8",
    fontSize: "12.5px",
    outline: "none",
    boxSizing: "border-box",
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
    transition: "background-color 0.18s ease, transform 0.1s ease",
    boxShadow: "0 2px 10px rgba(76, 141, 255, 0.3)",
    marginTop: "6px",
    cursor: "pointer",
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
};