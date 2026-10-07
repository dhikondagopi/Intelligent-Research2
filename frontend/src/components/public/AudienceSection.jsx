import {
  GraduationCap,
  Rocket,
  Briefcase,
  Building2,
  Building,
  Landmark,
  Check,
} from "lucide-react";

const AUDIENCES = [
  {
    role: "Researcher / Academic",
    icon: GraduationCap,
    badge: "Scholarly Discovery",
    value: "Uncover emerging research hotspots, trace citation velocity, and match prospective manuscripts directly to active federal grant solicitations.",
    bullets: [
      "Real-time citation and bibliometric velocity tracking",
      "Automated grant solicitation matching by domain",
      "Cross-institutional co-author network discovery",
    ],
  },
  {
    role: "Startup Founder",
    icon: Rocket,
    badge: "Commercialization",
    value: "Evaluate competitive IP moats, benchmark market readiness (TRL), identify prior art risks, and source non-dilutive agency funding.",
    bullets: [
      "USPTO prior art and competitor claim landscapes",
      "TRL progression milestones from bench to market",
      "SBIR/STTR non-dilutive funding opportunity alerts",
    ],
  },
  {
    role: "Innovation Manager",
    icon: Briefcase,
    badge: "R&D Portfolio",
    value: "Monitor institutional technology maturity across multi-lab pipelines, identify commercialization bottlenecks, and guide strategic capital allocations.",
    bullets: [
      "Unified portfolio technology readiness dashboards",
      "Cross-domain patent defensibility scoring",
      "Resource allocation and ROI impact forecasting",
    ],
  },
  {
    role: "University & TTO",
    icon: Landmark,
    badge: "Tech Transfer",
    value: "Accelerate institutional licensing pipelines, identify industrial partners seeking university IP, and benchmark university research impact against global peers.",
    bullets: [
      "Invention disclosure triage and commercialization scoring",
      "Corporate licensee matching based on patent trends",
      "Accreditation and external impact reporting metrics",
    ],
  },
  {
    role: "Enterprise R&D",
    icon: Building2,
    badge: "Horizon Scanning",
    value: "Maintain continuous surveillance of disruptive technologies, detect threat clusters early, and benchmark internal R&D against global patent trajectories.",
    bullets: [
      "Automated radar signals for disruptive technology inflection",
      "Deep competitor patent filing momentum analysis",
      "M&A and intellectual property acquisition diligence",
    ],
  },
  {
    role: "Research Center",
    icon: Building,
    badge: "Strategic Programs",
    value: "Harmonize multi-disciplinary consortia, monitor collaborative milestone progress, and quantify public research return on investment.",
    bullets: [
      "Multi-grant portfolio progress synchronization",
      "Regional and national scientific impact indexes",
      "Evidence-backed policy and funding renewal reports",
    ],
  },
];

export default function AudienceSection() {
  return (
    <section id="solutions" style={styles.section} aria-label="Who We Serve">
      <div style={styles.container}>
        {/* Section Heading */}
        <div style={styles.header}>
          <span style={styles.categoryBadge}>Who We Serve</span>
          <h2 style={styles.title}>
            Built for modern research and innovation teams
          </h2>
          <p style={styles.subtitle}>
            Purpose-built intelligence workflows tailored to the distinct analytical requirements of researchers, institutions, and deep-tech enterprises.
          </p>
        </div>

        {/* Audience Grid */}
        <div style={styles.grid}>
          {AUDIENCES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.role} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.iconBox}>
                    <Icon size={20} color="#2F6FED" />
                  </div>
                  <span style={styles.badge}>{item.badge}</span>
                </div>

                <h3 style={styles.roleTitle}>{item.role}</h3>
                <p style={styles.roleValue}>{item.value}</p>

                <div style={styles.bulletList}>
                  {item.bullets.map((b) => (
                    <div key={b} style={styles.bulletItem}>
                      <Check size={14} color="#2F6FED" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={styles.bulletText}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    backgroundColor: "#F5F7FA",
    padding: "88px 24px",
    borderBottom: "1px solid #D9E0EA",
  },
  container: {
    maxWidth: "1240px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    maxWidth: "760px",
    margin: "0 auto 56px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  categoryBadge: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#2F6FED",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  title: {
    fontSize: "clamp(26px, 3.4vw, 38px)",
    fontWeight: "800",
    color: "#101828",
    letterSpacing: "-0.03em",
    lineHeight: 1.2,
    margin: 0,
  },
  subtitle: {
    fontSize: "16px",
    color: "#536273",
    lineHeight: 1.55,
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    borderRadius: "12px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 8px rgba(16, 24, 40, 0.03)",
    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  iconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "rgba(47, 111, 237, 0.08)",
    border: "1px solid rgba(47, 111, 237, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#536273",
    backgroundColor: "#F5F7FA",
    padding: "3px 8px",
    borderRadius: "4px",
    border: "1px solid #D9E0EA",
  },
  roleTitle: {
    fontSize: "19px",
    fontWeight: "700",
    color: "#101828",
    margin: "0 0 10px",
    letterSpacing: "-0.02em",
  },
  roleValue: {
    fontSize: "14px",
    color: "#536273",
    lineHeight: 1.5,
    margin: "0 0 18px",
    flex: 1,
  },
  bulletList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingTop: "16px",
    borderTop: "1px solid #F5F7FA",
  },
  bulletItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  },
  bulletText: {
    fontSize: "12.5px",
    color: "#101828",
    lineHeight: 1.4,
    fontWeight: "500",
  },
};
