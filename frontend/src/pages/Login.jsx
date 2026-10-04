import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  BookOpen,
  DollarSign,
  Cpu,
  Sparkles,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const data = await loginUser(form);
      const role = data.role || "researcher";

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          user_id: data.user_id,
          name: data.name,
          email: data.email,
          role: role
        })
      );

      navigate(`/dashboard/${role}`);
    } catch (error) {
      console.error("Login error:", error);
      setMessage(
        error.response?.data?.detail || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background Orbs */}
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <div style={styles.container}>
        {/* LEFT SIDE: Hero Showcase */}
        <div style={styles.leftCol}>
          {/* Brand */}
          <div style={styles.brandRow}>
            <div style={styles.logo}>IR</div>
            <div>
              <div style={styles.brandTitle}>Intelligent Research</div>
              <div style={styles.brandSubtitle}>Research & Innovation Platform</div>
            </div>
          </div>

          {/* Badge */}
          <div style={styles.badgeRow}>
            <span style={styles.platformBadge}>
              <Sparkles size={13} style={{ marginRight: 6 }} />
              Enterprise Research Intelligence
            </span>
          </div>

          {/* Headline */}
          <h1 style={styles.headline}>
            Discover Research. <br />
            <span style={styles.headlineGradient}>Identify Technology.</span> <br />
            Accelerate Innovation.
          </h1>

          <p style={styles.description}>
            Empowering researchers, innovation managers, and institutional leaders with real-time bibliometrics, funding intelligence, and IP analytics.
          </p>

          {/* 4 Feature Highlights */}
          <div style={styles.featuresList}>
            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <BookOpen size={16} color="#60a5fa" />
              </div>
              <div>
                <div style={styles.featureTitle}>Research Intelligence</div>
                <div style={styles.featureSub}>Global OpenAlex citation graphs & trend analytics</div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <DollarSign size={16} color="#34d399" />
              </div>
              <div>
                <div style={styles.featureTitle}>Funding Intelligence</div>
                <div style={styles.featureSub}>Live NIH RePORTER grant opportunity tracking</div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <Cpu size={16} color="#c084fc" />
              </div>
              <div>
                <div style={styles.featureTitle}>Technology Intelligence</div>
                <div style={styles.featureSub}>USPTO & WIPO patent velocity monitoring</div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <Sparkles size={16} color="#f59e0b" />
              </div>
              <div>
                <div style={styles.featureTitle}>Innovation & Commercialization</div>
                <div style={styles.featureSub}>Single-source maturity scoring & licensing pathways</div>
              </div>
            </div>
          </div>

          {/* Trust Metrics */}
          <div style={styles.trustGrid}>
            <div style={styles.trustMetric}>
              <span style={styles.trustVal}>100k+</span>
              <span style={styles.trustLabel}>Indexed Patents</span>
            </div>
            <div style={styles.trustMetric}>
              <span style={styles.trustVal}>$1.2B+</span>
              <span style={styles.trustLabel}>Tracked Grants</span>
            </div>
            <div style={styles.trustMetric}>
              <span style={styles.trustVal}>50k+</span>
              <span style={styles.trustLabel}>Research Works</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Authentication Card */}
        <div style={styles.rightCol}>
          <div style={styles.authCard}>
            <div style={styles.cardHeader}>
              <div style={styles.lockIconBox}>
                <Lock size={20} color="#60a5fa" />
              </div>
              <h2 style={styles.cardTitle}>Welcome Back</h2>
              <p style={styles.cardSub}>Sign in to access your research intelligence workspace</p>
            </div>

            {message && (
              <div style={styles.errorBox}>
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrapper}>
                  <Mail size={16} style={styles.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@institution.edu"
                    value={form.email}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} style={styles.inputIcon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? (
                  <>
                    <RefreshCw size={16} style={styles.spinner} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div style={styles.cardFooter}>
              <span style={styles.footerText}>Don't have an account?</span>
              <Link to="/register" style={styles.link}>
                Create an account
              </Link>
            </div>

            <div style={styles.securityNote}>
              <ShieldCheck size={14} style={{ color: "#34d399", flexShrink: 0 }} />
              <span>256-bit Encrypted Enterprise Authorization</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#020617",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box"
  },

  glowOne: {
    position: "absolute",
    top: "-150px",
    left: "-150px",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(2, 6, 23, 0) 70%)",
    pointerEvents: "none"
  },

  glowTwo: {
    position: "absolute",
    bottom: "-150px",
    right: "-150px",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, rgba(2, 6, 23, 0) 70%)",
    pointerEvents: "none"
  },

  container: {
    maxWidth: "1240px",
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "60px",
    alignItems: "center",
    zIndex: 1
  },

  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  logo: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 25px rgba(37, 99, 235, 0.3)"
  },

  brandTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#f8fafc"
  },

  brandSubtitle: {
    fontSize: "11px",
    color: "#64748b"
  },

  badgeRow: {
    display: "flex"
  },

  platformBadge: {
    background: "rgba(37, 99, 235, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: "500",
    padding: "4px 12px",
    borderRadius: "20px",
    display: "inline-flex",
    alignItems: "center"
  },

  headline: {
    fontSize: "36px",
    fontWeight: "700",
    lineHeight: "1.2",
    color: "#f8fafc",
    letterSpacing: "-0.02em",
    margin: 0
  },

  headlineGradient: {
    background: "linear-gradient(135deg, #60a5fa, #c084fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },

  description: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: "1.6",
    margin: 0
  },

  featuresList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },

  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid #1e293b",
    padding: "12px 16px",
    borderRadius: "12px"
  },

  featureIconBox: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "#1e293b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },

  featureTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#f8fafc"
  },

  featureSub: {
    fontSize: "11px",
    color: "#64748b"
  },

  trustGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    borderTop: "1px solid #1e293b",
    paddingTop: "20px"
  },

  trustMetric: {
    display: "flex",
    flexDirection: "column"
  },

  trustVal: {
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "-0.02em",
    color: "#f8fafc"
  },

  trustLabel: {
    fontSize: "11px",
    color: "#64748b"
  },

  rightCol: {
    display: "flex",
    justifyContent: "center"
  },

  authCard: {
    width: "100%",
    maxWidth: "440px",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "20px",
    padding: "36px 32px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },

  cardHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center"
  },

  lockIconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "rgba(37, 99, 235, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "14px"
  },

  cardTitle: {
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "-0.015em",
    color: "#f8fafc",
    margin: "0 0 6px 0"
  },

  cardSub: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: 0
  },

  errorBox: {
    background: "rgba(127, 29, 29, 0.25)",
    border: "1px solid #7f1d1d",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#fca5a5",
    fontSize: "12px",
    textAlign: "center"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },

  label: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#cbd5e1"
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },

  inputIcon: {
    position: "absolute",
    left: "14px",
    color: "#64748b"
  },

  input: {
    width: "100%",
    background: "#020617",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "11px 40px 11px 40px",
    color: "#f8fafc",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border 0.2s ease"
  },

  eyeBtn: {
    position: "absolute",
    right: "12px",
    background: "transparent",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    padding: "4px"
  },

  submitBtn: {
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "8px",
    boxShadow: "0 4px 16px rgba(37, 99, 235, 0.35)",
    transition: "all 0.2s ease"
  },

  spinner: {
    animation: "spin 1s linear infinite"
  },

  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontSize: "12px"
  },

  footerText: {
    color: "#64748b"
  },

  link: {
    color: "#60a5fa",
    fontWeight: "600",
    textDecoration: "none"
  },

  securityNote: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontSize: "11px",
    color: "#64748b",
    borderTop: "1px solid #1e293b",
    paddingTop: "14px",
    marginTop: "4px"
  }
};

export default Login;
