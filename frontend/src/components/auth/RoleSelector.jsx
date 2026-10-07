import { GraduationCap, Rocket, Briefcase, ShieldAlert, Check } from "lucide-react";

export const ROLE_OPTIONS = [
  {
    id: "researcher",
    title: "Researcher / Academic",
    description: "Track citations, bibliometrics, grant funding, and cross-domain literature velocity.",
    icon: GraduationCap,
    badge: "Core Access",
  },
  {
    id: "founder",
    title: "Startup Founder",
    description: "Assess IP defensibility, market readiness, competitor patents, and venture funding.",
    icon: Rocket,
    badge: "Commercialization",
  },
  {
    id: "manager",
    title: "Innovation Manager",
    description: "Manage portfolio TRL stages, institutional research pipelines, and R&D ROI.",
    icon: Briefcase,
    badge: "Portfolio & R&D",
  },
  {
    id: "admin",
    title: "Administrator",
    description: "Audit compliance, user governance, institutional API keys, and system configuration.",
    icon: ShieldAlert,
    badge: "Invite Required",
    restricted: true,
  },
];

export default function RoleSelector({
  selectedRole,
  onSelectRole,
  adminInviteCode = "",
  onAdminInviteCodeChange = () => {},
  error = null,
}) {
  const isRestrictedAdmin = selectedRole === "admin";

  return (
    <div style={styles.container}>
      <div style={styles.labelRow}>
        <span style={styles.label}>
          Select Workspace Role <span style={styles.requiredMark}>*</span>
        </span>
        <span style={styles.roleHint}>Tailors your default dashboard & intelligence models</span>
      </div>

      <div style={styles.grid}>
        {ROLE_OPTIONS.map((role) => {
          const isSelected = selectedRole === role.id;
          const Icon = role.icon;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelectRole(role.id)}
              style={{
                ...styles.roleCard,
                borderColor: isSelected ? "#4C8DFF" : "#202A38",
                backgroundColor: isSelected ? "rgba(76, 141, 255, 0.08)" : "#151D29",
                boxShadow: isSelected ? "0 0 0 1px #4C8DFF, 0 4px 16px rgba(0, 0, 0, 0.25)" : "none",
              }}
              aria-pressed={isSelected}
            >
              <div style={styles.cardHeader}>
                <div
                  style={{
                    ...styles.iconBox,
                    backgroundColor: isSelected ? "#4C8DFF" : "#101620",
                    color: isSelected ? "#FFFFFF" : "#4C8DFF",
                  }}
                  aria-hidden="true"
                >
                  <Icon size={16} />
                </div>
                <div style={styles.headerRight}>
                  {role.restricted ? (
                    <span style={styles.restrictedBadge}>{role.badge}</span>
                  ) : (
                    <span style={styles.roleBadge}>{role.badge}</span>
                  )}
                  <div
                    style={{
                      ...styles.checkbox,
                      borderColor: isSelected ? "#4C8DFF" : "#202A38",
                      backgroundColor: isSelected ? "#4C8DFF" : "transparent",
                    }}
                  >
                    {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </div>
                </div>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.roleTitle}>{role.title}</div>
                <div style={styles.roleDescription}>{role.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Security notice when Administrator is chosen */}
      {isRestrictedAdmin && (
        <div style={styles.securityBox} role="alert">
          <div style={styles.securityHeader}>
            <ShieldAlert size={16} color="#D9A441" />
            <span style={styles.securityTitle}>Institutional Authorization Required</span>
          </div>
          <p style={styles.securityText}>
            To protect institutional research assets, administrative access cannot be self-granted. Enter an institutional admin invitation code below. If you do not have an invite code, your account will be provisioned as a Researcher and promoted once verified by your organization.
          </p>
          <div style={styles.inviteInputRow}>
            <input
              type="text"
              value={adminInviteCode}
              onChange={(e) => onAdminInviteCodeChange(e.target.value)}
              placeholder="e.g. ADM-INV-8942-XQ"
              style={styles.inviteInput}
              aria-label="Admin invitation code"
            />
          </div>
        </div>
      )}

      {error && <div style={styles.errorMessage}>{error}</div>}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
  },
  labelRow: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#F2F5F8",
  },
  requiredMark: {
    color: "#E05B61",
  },
  roleHint: {
    fontSize: "12px",
    color: "#98A4B5",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "10px",
  },
  roleCard: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    padding: "14px",
    borderRadius: "10px",
    borderWidth: "1px",
    borderStyle: "solid",
    cursor: "pointer",
    transition: "all 0.18s ease",
    position: "relative",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
    width: "100%",
  },
  iconBox: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.18s ease",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  roleBadge: {
    fontSize: "10px",
    color: "#98A4B5",
    backgroundColor: "rgba(152, 164, 181, 0.12)",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "500",
  },
  restrictedBadge: {
    fontSize: "10px",
    color: "#D9A441",
    backgroundColor: "rgba(217, 164, 65, 0.12)",
    border: "1px solid rgba(217, 164, 65, 0.25)",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "600",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    borderRadius: "4px",
    borderWidth: "1px",
    borderStyle: "solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.18s ease",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  roleTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#F2F5F8",
    lineHeight: 1.25,
  },
  roleDescription: {
    fontSize: "11px",
    color: "#98A4B5",
    lineHeight: 1.35,
  },
  securityBox: {
    backgroundColor: "rgba(217, 164, 65, 0.08)",
    border: "1px solid rgba(217, 164, 65, 0.25)",
    borderRadius: "8px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  securityHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  securityTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#D9A441",
  },
  securityText: {
    fontSize: "12px",
    color: "#F2F5F8",
    lineHeight: 1.4,
    margin: 0,
  },
  inviteInputRow: {
    marginTop: "2px",
  },
  inviteInput: {
    width: "100%",
    height: "36px",
    padding: "0 12px",
    backgroundColor: "#101620",
    border: "1px solid #202A38",
    borderRadius: "6px",
    color: "#F2F5F8",
    fontSize: "13px",
    outline: "none",
  },
  errorMessage: {
    fontSize: "12px",
    color: "#E05B61",
  },
};
