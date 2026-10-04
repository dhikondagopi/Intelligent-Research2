import React, { useEffect, useState } from "react";
import {
  User,
  Building2,
  BookOpen,
  Award,
  Save,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Globe,
  Sparkles
} from "lucide-react";

import { getProfile, updateProfile } from "../services/profileService";
import SectionHeader from "../components/SectionHeader";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [form, setForm] = useState({
    affiliation: "",
    department: "",
    bio: "",
    research_interests: "",
    skills: "",
    orcid: ""
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const data = await getProfile(user.user_id);
        setForm({
          affiliation: data.affiliation || "",
          department: data.department || "",
          bio: data.bio || "",
          research_interests: data.research_interests?.join(", ") || "",
          skills: data.skills?.join(", ") || "",
          orcid: data.orcid || ""
        });
      } catch (error) {
        console.error("Failed to load profile", error);
        setMessage("Failed to load profile data.");
        setIsError(true);
      }
    };

    loadProfile();
  }, [user?.user_id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const profileData = {
        affiliation: form.affiliation,
        department: form.department,
        bio: form.bio,
        research_interests: form.research_interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        skills: form.skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        orcid: form.orcid
      };

      await updateProfile(user.user_id, profileData);
      setMessage("Research profile updated successfully!");
      setIsError(false);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.detail || "Failed to save profile changes.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.unauthCard}>
          <User size={32} color="#60a5fa" />
          <h2 style={{ fontSize: "18px", color: "#f8fafc" }}>Authentication Required</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>Please sign in to access and edit your research profile.</p>
        </div>
      </div>
    );
  }

  const formatRole = (role) => {
    if (!role) return "User";
    return role.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div style={styles.container}>
      <SectionHeader
        title="Research Profile & Preferences"
        subtitle="Manage your institutional affiliation, research interests, skills, and notification targeting criteria."
        icon={User}
        badge="Account Settings"
      />

      <div style={styles.layoutGrid}>
        {/* Left Column: User Identity Card */}
        <div style={styles.userCard}>
          <div style={styles.avatarLarge}>
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <h3 style={styles.userName}>{user.name || "User"}</h3>
          <span style={styles.userEmail}>{user.email}</span>

          <div style={styles.roleBadge}>
            <Briefcase size={13} style={{ marginRight: 4 }} />
            {formatRole(user.role)}
          </div>

          <div style={styles.userMetaDivider} />

          <div style={styles.userMetaBox}>
            <div style={styles.metaRow}>
              <Building2 size={14} color="#64748b" />
              <span>{form.affiliation || "Affiliation not set"}</span>
            </div>
            <div style={styles.metaRow}>
              <Globe size={14} color="#64748b" />
              <span>ORCID: {form.orcid || "Not linked"}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Edit Form */}
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Profile Information</h3>

          {message && (
            <div style={isError ? styles.errorBanner : styles.successBanner}>
              {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.rowGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Affiliation / Institution</label>
                <input
                  name="affiliation"
                  placeholder="e.g. Stanford University, MIT..."
                  value={form.affiliation}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Department</label>
                <input
                  name="department"
                  placeholder="e.g. Computer Science, Biotechnology"
                  value={form.department}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Research Bio</label>
              <textarea
                name="bio"
                placeholder="Describe your primary research focus, recent work, and academic background..."
                value={form.bio}
                onChange={handleChange}
                rows={4}
                style={styles.textarea}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Research Interests (Comma Separated)</label>
              <input
                name="research_interests"
                placeholder="Artificial Intelligence, Genomics, Quantum Computing, Cancer Research"
                value={form.research_interests}
                onChange={handleChange}
                style={styles.input}
              />
              <span style={styles.fieldHelp}>
                Alerts and funding recommendations match these keywords automatically.
              </span>
            </div>

            <div style={styles.rowGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Technical Skills / Methodologies</label>
                <input
                  name="skills"
                  placeholder="Python, CRISPR, PyTorch, Next.js"
                  value={form.skills}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>ORCID iD</label>
                <input
                  name="orcid"
                  placeholder="0000-0002-1825-0097"
                  value={form.orcid}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formFooter}>
              <button type="submit" disabled={loading} style={styles.saveBtn}>
                <Save size={15} />
                <span>{loading ? "Saving..." : "Save Profile Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "28px 36px",
    maxWidth: "1440px",
    margin: "0 auto",
    color: "#f8fafc"
  },
  unauthCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "40px",
    textAlign: "center",
    maxWidth: "400px",
    margin: "40px auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px"
  },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "24px"
  },
  userCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "28px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center"
  },
  avatarLarge: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "14px",
    boxShadow: "0 8px 25px rgba(37, 99, 235, 0.3)"
  },
  userName: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "-0.015em",
    color: "#f8fafc",
    margin: "0 0 2px 0"
  },
  userEmail: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "12px"
  },
  roleBadge: {
    background: "rgba(37, 99, 235, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    color: "#60a5fa",
    fontSize: "11px",
    fontWeight: "500",
    padding: "4px 10px",
    borderRadius: "20px",
    display: "inline-flex",
    alignItems: "center"
  },
  userMetaDivider: {
    width: "100%",
    height: "1px",
    background: "#1e293b",
    margin: "18px 0"
  },
  userMetaBox: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
    fontSize: "12px"
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#cbd5e1"
  },
  formCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  formTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: 0,
    borderBottom: "1px solid #1e293b",
    paddingBottom: "12px"
  },
  successBanner: {
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#34d399",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  errorBanner: {
    background: "rgba(127, 29, 29, 0.25)",
    border: "1px solid #7f1d1d",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#fca5a5",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },
  rowGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px"
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#cbd5e1"
  },
  input: {
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#f8fafc",
    fontSize: "13px",
    outline: "none"
  },
  textarea: {
    background: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#f8fafc",
    fontSize: "13px",
    outline: "none",
    resize: "vertical"
  },
  fieldHelp: {
    fontSize: "11px",
    color: "#64748b"
  },
  formFooter: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "10px"
  },
  saveBtn: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)"
  }
};

export default Profile;