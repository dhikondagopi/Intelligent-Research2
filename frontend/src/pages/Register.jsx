import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  Sparkles,
  RefreshCw,
  BookOpen,
  DollarSign,
  Cpu
} from "lucide-react";

import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "researcher"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
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
    setIsError(false);
    setLoading(true);

    try {
      await registerUser(form);
      setMessage("Account registered successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.detail || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <div style={styles.container}>
        {/* LEFT SIDE Showcase */}
        <div style={styles.leftCol}>
          <div style={styles.brandRow}>
            <div style={styles.logo}>IR</div>
            <div>
              <div style={styles.brandTitle}>Intelligent Research</div>
              <div style={styles.brandSubtitle}>Research & Innovation Platform</div>
            </div>
          </div>

          <div style={styles.badgeRow}>
            <span style={styles.platformBadge}>
              <Sparkles size={13} style={{ marginRight: 6 }} />
              Create Institutional Account
            </span>
          </div>

          <h1 style={styles.headline}>
            Join the Next Era of <br />
            <span style={styles.headlineGradient}>Scientific Intelligence.</span>
          </h1>

          <p style={styles.description}>
            Access real-time bibliometrics, funding grant tracking, patent landscapes, and cross-domain innovation scoring in one integrated platform.
          </p>

          <div style={styles.featuresList}>
            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <BookOpen size={16} color="#4C8DFF" />
              </div>
              <div>
                <div style={styles.featureTitle}>Role-Tailored Dashboards</div>
                <div style={styles.featureSub}>Customized metrics for researchers, founders & executives</div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <DollarSign size={16} color="#4C8DFF" />
              </div>
              <div>
                <div style={styles.featureTitle}>Grant & Award Intelligence</div>
                <div style={styles.featureSub}>Direct synchronization with federal funding registries</div>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIconBox}>
                <Cpu size={16} color="#4C8DFF" />
              </div>
              <div>
                <div style={styles.featureTitle}>Automated Executive Reports</div>
                <div style={styles.featureSub}>Export decision-ready PDF & Excel datasets</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE Registration Card */}
        <div style={styles.rightCol}>
          <div style={styles.authCard}>
            <div style={styles.cardHeader}>
              <div style={styles.userIconBox}>
                <User size={20} color="#4C8DFF" />
              </div>
              <h2 style={styles.cardTitle}>Create Account</h2>
              <p style={styles.cardSub}>Enter your information to register a platform user account</p>
            </div>

            {message && (
              <div style={isError ? styles.errorBox : styles.successBox}>
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Name</label>
                <div style={styles.inputWrapper}>
                  <User size={16} style={styles.inputIcon} />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Dr. Jane Doe"
                    value={form.name}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrapper}>
                  <Mail size={16} style={styles.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="jane.doe@university.edu"
                    value={form.email}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Institutional Role</label>
                <div style={styles.inputWrapper}>
                  <Briefcase size={16} style={styles.inputIcon} />
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="researcher">Researcher / Academic</option>
                    <option value="innovation_manager">Innovation Manager / TTO</option>
                    <option value="startup_founder">Startup Founder / Entrepreneur</option>
                    <option value="research_organization">Research Organization Executive</option>
                  </select>
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
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Platform Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div style={styles.cardFooter}>
              <span style={styles.footerText}>Already registered?</span>
              <Link to="/login" style={styles.link}>
                Sign in
              </Link>
            </div>

            <div style={styles.securityNote}>
              <ShieldCheck size={14} style={{ color: "#35C98A", flexShrink: 0 }} />
              <span>Compliant with institutional security policies</span>
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
    right: "-150px",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(76, 141, 255, 0.12) 0%, rgba(8, 11, 18, 0) 70%)",
    pointerEvents: "none"
  },

  glowTwo: {
    position: "absolute",
    bottom: "-150px",
    left: "-150px",
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
    padding: "32px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },

  cardHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center"
  },

  userIconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "rgba(76, 141, 255, 0.12)",
    border: "1px solid rgba(76, 141, 255, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px"
  },

  cardTitle: {
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "-0.015em",
    color: "#F2F5F8",
    margin: "0 0 4px 0"
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

  successBox: {
    background: "rgba(53, 201, 138, 0.12)",
    border: "1px solid rgba(53, 201, 138, 0.3)",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#35C98A",
    fontSize: "12px",
    textAlign: "center"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px"
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
    padding: "10px 40px 10px 40px",
    color: "#F2F5F8",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box"
  },

  select: {
    width: "100%",
    background: "#0B0F17",
    border: "1px solid #202A38",
    borderRadius: "10px",
    padding: "10px 14px 10px 40px",
    color: "#F2F5F8",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer"
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
    marginTop: "6px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)"
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
    paddingTop: "12px"
  }
};

export default Register;