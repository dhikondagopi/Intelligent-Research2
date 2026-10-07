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
                <BookOpen size={16} color="#4C8DFF" />
              </div>
              <div>
                <div style={styles.featureTitle}>Research Intelligence</div>
                <div style={styles.featureSub}>Global OpenAlex citation graphs & trend analytics</div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <DollarSign size={16} color="#4C8DFF" />
              </div>
              <div>
                <div style={styles.featureTitle}>Funding Intelligence</div>
                <div style={styles.featureSub}>Live NIH RePORTER grant opportunity tracking</div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <Cpu size={16} color="#4C8DFF" />
              </div>
              <div>
                <div style={styles.featureTitle}>Technology Intelligence</div>
                <div style={styles.featureSub}>USPTO & WIPO patent velocity monitoring</div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <Sparkles size={16} color="#4C8DFF" />
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
                <Lock size={20} color="#4C8DFF" />
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
              <ShieldCheck size={14} style={{ color: "#35C98A", flexShrink: 0 }} />
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
    background: "#080B12",
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
    background: "radial-gradient(circle, rgba(76, 141, 255, 0.12) 0%, rgba(8, 11, 18, 0) 70%)",
    pointerEvents: "none"
  },

  glowTwo: {
    position: "absolute",
    bottom: "-150px",
    right: "-150px",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(76, 141, 255, 0.12) 0%, rgba(8, 11, 18, 0) 70%)",
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
    background: "#101620",
    border: "1px solid #4C8DFF",
    color: "#4C8DFF",
    fontSize: "18px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)"
  },

  brandTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#F2F5F8"
  },

  brandSubtitle: {
    fontSize: "11px",
    color: "#98A4B5"
  },

  badgeRow: {
    display: "flex"
  },

  platformBadge: {
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid rgba(76, 141, 255, 0.3)",
    color: "#4C8DFF",
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
    color: "#F2F5F8",
    letterSpacing: "-0.02em",
    margin: 0
  },

  headlineGradient: {
    color: "#4C8DFF"
  },

  description: {
    fontSize: "14px",
    color: "#98A4B5",
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
    background: "#101620",
    border: "1px solid #202A38",
    padding: "12px 16px",
    borderRadius: "12px"
  },

  featureIconBox: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "#0B0F17",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },

  featureTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#F2F5F8"
  },

  featureSub: {
    fontSize: "11px",
    color: "#98A4B5"
  },

  trustGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    borderTop: "1px solid #202A38",
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
    color: "#F2F5F8"
  },

  trustLabel: {
    fontSize: "11px",
    color: "#98A4B5"
  },

  rightCol: {
    display: "flex",
    justifyContent: "center"
  },

  authCard: {
    width: "100%",
    maxWidth: "440px",
    background: "#101620",
    border: "1px solid #202A38",
    borderRadius: "20px",
    padding: "36px 32px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
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
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid rgba(76, 141, 255, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "14px"
  },

  cardTitle: {
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "-0.015em",
    color: "#F2F5F8",
    margin: "0 0 6px 0"
  },

  cardSub: {
    fontSize: "12px",
    color: "#98A4B5",
    margin: 0
  },

  errorBox: {
    background: "rgba(224, 91, 97, 0.12)",
    border: "1px solid #E05B61",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#E05B61",
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
    color: "#F2F5F8"
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },

  inputIcon: {
    position: "absolute",
    left: "14px",
    color: "#98A4B5"
  },

  input: {
    width: "100%",
    background: "#0B0F17",
    border: "1px solid #202A38",
    borderRadius: "10px",
    padding: "11px 40px 11px 40px",
    color: "#F2F5F8",
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
    color: "#98A4B5",
    cursor: "pointer",
    padding: "4px"
  },

  submitBtn: {
    background: "#4C8DFF",
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
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)",
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
    color: "#98A4B5"
  },

  link: {
    color: "#4C8DFF",
    fontWeight: "600",
    textDecoration: "none"
  },

  securityNote: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontSize: "11px",
    color: "#98A4B5",
    borderTop: "1px solid #202A38",
    paddingTop: "14px",
    marginTop: "4px"
  }
};

export default Login;
