import { UserCheck, Sliders, Compass, Sparkles } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Create your profile",
    desc: "Set up your workspace with institutional affiliation and role-based permissions (Researcher, Founder, Innovation Manager, or TTO Administrator).",
    icon: UserCheck,
  },
  {
    step: "02",
    title: "Define research interests",
    desc: "Configure your research domains, keywords, and technology areas. The platform tailors semantic embeddings to your specific scientific focus.",
    icon: Sliders,
  },
  {
    step: "03",
    title: "Discover research, funding, patents and technology",
    desc: "Explore synchronized multi-source intelligence feeds with unified filtering, real-time grant matching, and interactive patent classification landscapes.",
    icon: Compass,
  },
  {
    step: "04",
    title: "Generate innovation insights and recommendations",
    desc: "Synthesize empirical scoring matrices across novelty, defensibility, and market timing to generate actionable commercialization pathways.",
    icon: Sparkles,
  },
];

export default function HowItWorksSection() {
  return (
    <section style={styles.section} aria-label="How It Works">
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.categoryBadge}>User Journey</span>
          <h2 style={styles.title}>How It Works</h2>
          <p style={styles.subtitle}>
            A streamlined four-step progression from initial profile configuration to automated commercialization roadmaps.
          </p>
        </div>

        <div style={styles.stepGrid}>
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} style={styles.stepCard}>
                <div style={styles.stepHeader}>
                  <span style={styles.stepNumber}>{s.step}</span>
                  <div style={styles.iconBox}>
                    <Icon size={18} color="#2F6FED" />
                  </div>
                </div>

                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepDesc}>{s.desc}</p>
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
    backgroundColor: "#FFFFFF",
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
    margin: "0 auto 52px",
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
  stepGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
  },
  stepCard: {
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    borderRadius: "10px",
    padding: "26px 22px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  stepHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  stepNumber: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#172554",
    fontFamily: "'Inter', monospace",
  },
  iconBox: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#101828",
    lineHeight: 1.3,
    margin: 0,
  },
  stepDesc: {
    fontSize: "13.5px",
    color: "#536273",
    lineHeight: 1.55,
    margin: 0,
  },
};
