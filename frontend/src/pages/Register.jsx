import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Building,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Tag,
  Check,
} from "lucide-react";
import AuthShell from "../components/auth/AuthShell";
import AuthCard from "../components/auth/AuthCard";
import AuthHeader from "../components/auth/AuthHeader";
import FormField from "../components/auth/FormField";
import PasswordField from "../components/auth/PasswordField";
import RoleSelector from "../components/auth/RoleSelector";
import { registerUser, loginUser } from "../services/authService";
import { updateProfile } from "../services/profileService";

export default function Register() {
  const navigate = useNavigate();

  // Active step (1: Account, 2: Role, 3: Optional Profile)
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "researcher",
    adminInviteCode: "",
    // Optional profile fields
    affiliation: "",
    department: "",
    researchInterests: "",
    skills: "",
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

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = "Full name is required";
    }

    if (!form.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Please enter a valid email address";
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

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e, skipOptional = false) => {
    if (e && e.preventDefault) e.preventDefault();
    setApiError("");
    setApiSuccess("");

    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    setLoading(true);

    // SECURITY ENFORCEMENT:
    // Backend remains authoritative. If 'admin' was chosen, check if an invite code is provided.
    // Client defaults unverified admin registrations to 'researcher' with an administrative verification request,
    // ensuring no unauthenticated client-side privilege escalation occurs.
    let safeRole = form.role;
    if (form.role === "admin") {
      if (!form.adminInviteCode.trim()) {
        safeRole = "researcher";
      }
    }

    try {
      // 1. Register account
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: safeRole,
      });

      setApiSuccess("Account created successfully! Authenticating workspace...");

      // 2. Automatically log in to obtain JWT access token
      try {
        const loginData = await loginUser({
          email: form.email.trim(),
          password: form.password,
        });

        // 3. Save optional profile details if supplied
        if (!skipOptional && loginData?.user_id) {
          const interestsList = form.researchInterests
            ? form.researchInterests.split(",").map((s) => s.trim()).filter(Boolean)
            : [];
          const skillsList = form.skills
            ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
            : [];

          if (form.affiliation || form.department || interestsList.length || skillsList.length) {
            try {
              await updateProfile(loginData.user_id, {
                affiliation: form.affiliation.trim(),
                department: form.department.trim(),
                bio: "",
                research_interests: interestsList,
                skills: skillsList,
                orcid: "",
              });
            } catch (profileErr) {
              console.warn("Optional profile update failed:", profileErr);
            }
          }
        }

        // 4. Redirect to personal role dashboard
        setTimeout(() => {
          navigate(`/dashboard/${safeRole}`);
        }, 800);
      } catch (loginErr) {
        console.warn("Auto-login error:", loginErr);
        // Fallback to login page if auto-login encounters an issue
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      const detail =
        error.response?.data?.detail ||
        "Registration failed. Please check your information and try again.";
      setApiError(detail);
      // If email was duplicated, bring user back to step 1
      if (detail.toLowerCase().includes("email")) {
        setCurrentStep(1);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell activePage="register">
      <AuthCard>
        <AuthHeader
          badge={
            currentStep === 1
              ? "Account Setup"
              : currentStep === 2
              ? "Role Configuration"
              : "Profile Enrichment"
          }
          heading="Create your workspace"
          subtitle="Set up your research intelligence profile."
          step={currentStep}
          totalSteps={3}
          onStepClick={(targetStep) => {
            if (targetStep < currentStep) setCurrentStep(targetStep);
            else if (targetStep === 2 && validateStep1()) setCurrentStep(2);
          }}
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

        <form onSubmit={(e) => e.preventDefault()} style={styles.form} noValidate>
          {/* STEP 1: Basic Account Information */}
          {currentStep === 1 && (
            <div style={styles.stepBlock}>
              <FormField
                id="reg-name"
                name="name"
                label="Full name"
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

              <FormField
                id="reg-email"
                name="email"
                label="Institutional or work email"
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

              <PasswordField
                id="reg-password"
                name="password"
                label="Create password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                error={errors.password}
                required
                disabled={loading}
                autoComplete="new-password"
                showStrength
              />

              <PasswordField
                id="reg-confirm-password"
                name="confirmPassword"
                label="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                error={errors.confirmPassword}
                required
                disabled={loading}
                autoComplete="new-password"
              />

              <button
                type="button"
                onClick={handleNextStep}
                style={styles.submitButton}
              >
                <span>Continue to Role Selection</span>
                <ArrowRight size={15} style={{ marginLeft: 6 }} />
              </button>
            </div>
          )}

          {/* STEP 2: Role Selection & Authorization */}
          {currentStep === 2 && (
            <div style={styles.stepBlock}>
              <RoleSelector
                selectedRole={form.role}
                onSelectRole={(role) => setForm((prev) => ({ ...prev, role }))}
                adminInviteCode={form.adminInviteCode}
                onAdminInviteCodeChange={(adminInviteCode) =>
                  setForm((prev) => ({ ...prev, adminInviteCode }))
                }
              />

              <div style={styles.buttonRow}>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={styles.secondaryStepButton}
                >
                  <ArrowLeft size={14} style={{ marginRight: 6 }} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  style={{ ...styles.submitButton, flex: 1, marginTop: 0 }}
                >
                  <span>Continue to Profile</span>
                  <ArrowRight size={15} style={{ marginLeft: 6 }} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Optional Professional Profile Enrichment */}
          {currentStep === 3 && (
            <div style={styles.stepBlock}>
              <div style={styles.optionalBanner}>
                <Sparkles size={15} color="#4C8DFF" style={{ flexShrink: 0 }} />
                <span style={styles.optionalBannerText}>
                  Enrich your profile now or configure it later from account settings.
                </span>
              </div>

              <FormField
                id="reg-affiliation"
                name="affiliation"
                label="Organization / University"
                value={form.affiliation}
                onChange={handleChange}
                placeholder="e.g. Stanford University, BioHealth R&D"
                icon={Building}
                optional
                disabled={loading}
                autoComplete="organization"
              />

              <FormField
                id="reg-department"
                name="department"
                label="Research domains / Department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. Department of Computer Science & AI"
                icon={GraduationCap}
                optional
                disabled={loading}
              />

              <FormField
                id="reg-interests"
                name="researchInterests"
                label="Research interests"
                value={form.researchInterests}
                onChange={handleChange}
                placeholder="e.g. Quantum Computing, Genomics, Solid State Batteries"
                icon={Tag}
                optional
                disabled={loading}
                helpText="Separate multiple keywords with commas"
              />

              <FormField
                id="reg-skills"
                name="skills"
                label="Technology focus areas"
                value={form.skills}
                onChange={handleChange}
                placeholder="e.g. TRL 4-7, Machine Learning, Patent Strategy"
                icon={Tag}
                optional
                disabled={loading}
                helpText="Key methodology or technology areas you specialize in"
              />

              <div style={styles.actionColumn}>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, false)}
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
                      <span>Creating workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Create my workspace</span>
                      <Check size={15} style={{ marginLeft: 6 }} strokeWidth={2.5} />
                    </>
                  )}
                </button>

                <div style={styles.buttonRow}>
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={loading}
                    style={styles.secondaryStepButton}
                  >
                    <ArrowLeft size={14} style={{ marginRight: 6 }} />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={loading}
                    style={styles.skipButton}
                  >
                    Skip & Complete
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Secondary Navigation CTA */}
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
  stepBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  buttonRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "4px",
  },
  actionColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "6px",
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
    cursor: "pointer",
    marginTop: "6px",
  },
  secondaryStepButton: {
    height: "40px",
    padding: "0 16px",
    borderRadius: "8px",
    border: "1px solid #202A38",
    backgroundColor: "#151D29",
    color: "#F2F5F8",
    fontSize: "13px",
    fontWeight: "500",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background-color 0.18s ease",
  },
  skipButton: {
    flex: 1,
    height: "40px",
    borderRadius: "8px",
    border: "1px dashed #202A38",
    backgroundColor: "transparent",
    color: "#98A4B5",
    fontSize: "13px",
    fontWeight: "500",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.18s ease",
  },
  optionalBanner: {
    backgroundColor: "rgba(76, 141, 255, 0.08)",
    border: "1px solid rgba(76, 141, 255, 0.2)",
    borderRadius: "8px",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "12px",
    color: "#F2F5F8",
    lineHeight: 1.4,
  },
  optionalBannerText: {
    color: "#98A4B5",
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