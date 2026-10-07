import { Database, ShieldCheck, CheckCircle2, Globe, Cpu, FileText, Layers } from "lucide-react";

const DATA_SOURCES = [
  {
    name: "USPTO Open Data Portal",
    type: "Patent Intellectual Property",
    status: "Active Direct API & Cached",
    desc: "Over 325,000+ patents, full-text patent claims, CPC technology classification taxonomies, applicant assignee structures, and inventor geographic tracking.",
    coverage: "325,826+ records indexed",
    icon: FileText,
  },
  {
    name: "NIH RePORTER",
    type: "Federal Biomedical Grants",
    status: "Integrated Direct Feeds",
    desc: "Comprehensive database of scientific awards funded by the National Institutes of Health, award amounts, principal investigators, and project abstracts.",
    coverage: "Multi-million dollar federal awards",
    icon: Layers,
  },
  {
    name: "OpenAlex Scholarly Graph",
    type: "Bibliometric Knowledge Base",
    status: "Integrated Scientific Index",
    desc: "Global index of scholarly papers, author affiliations, citation counts, topic modeling, and open-access research repositories.",
    coverage: "100M+ global works and concepts",
    icon: Globe,
  },
  {
    name: "Crossref Metadata API",
    type: "Digital Object Registry",
    status: "Integrated Citation Registry",
    desc: "Official digital object identifier (DOI) registry delivering cross-publisher metadata, author citation linkages, and publication funding acknowledgments.",
    coverage: "Universal academic DOI resolution",
    icon: Database,
  },
  {
    name: "Semantic Scholar",
    type: "Scientific Literature Graph",
    status: "Integrated Literature Feed",
    desc: "AI-curated scientific literature index measuring citation influence, methodology extraction, and cross-domain paper recommendations.",
    coverage: "High-influence citation graphs",
    icon: Cpu,
  },
];

export default function DataSourcesSection() {
  return (
    <section id="data" style={styles.section} aria-label="Trusted Data Sources">
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.categoryBadge}>Data Integrity & Provenance</span>
          <h2 style={styles.title}>
            Built on trusted research and funding data
          </h2>
          <p style={styles.subtitle}>
            Intelligent Research integrates directly with official, audited repositories of scientific literature, government grants, and international patent offices. No synthetic hallucinations.
          </p>
        </div>

        <div style={styles.grid}>
          {DATA_SOURCES.map((source) => {
            const Icon = source.icon;
            return (
              <div key={source.name} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.iconBox}>
                    <Icon size={18} color="#2F6FED" />
                  </div>
                  <span style={styles.statusPill}>
                    <span style={styles.statusDot} />
                    {source.status}
                  </span>
                </div>

                <h3 style={styles.sourceName}>{source.name}</h3>
                <span style={styles.sourceType}>{source.type}</span>
                <p style={styles.sourceDesc}>{source.desc}</p>

                <div style={styles.coverageRow}>
                  <CheckCircle2 size={13} color="#2F6FED" />
                  <span style={styles.coverageText}>{source.coverage}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Audit / Compliance Guarantee Callout */}
        <div style={styles.complianceBox}>
          <ShieldCheck size={20} color="#172554" style={{ flexShrink: 0 }} />
          <div style={styles.complianceText}>
            <strong style={styles.complianceTitle}>Enterprise Data Governance: </strong>
            <span>
              All data ingested into the Intelligent Research platform is normalized through deterministic schema pipelines with persistent provenance tracking. User research queries and institutional profiles are encrypted and never used for model training.
            </span>
          </div>
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    marginBottom: "36px",
  },
  card: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    borderRadius: "10px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    boxShadow: "0 2px 6px rgba(16, 24, 40, 0.03)",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  iconBox: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statusPill: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#172554",
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    padding: "3px 8px",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  statusDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    backgroundColor: "#2F6FED",
  },
  sourceName: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#101828",
    margin: 0,
    lineHeight: 1.25,
  },
  sourceType: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#2F6FED",
  },
  sourceDesc: {
    fontSize: "13.5px",
    color: "#536273",
    lineHeight: 1.5,
    margin: "4px 0 12px",
    flex: 1,
  },
  coverageRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    paddingTop: "12px",
    borderTop: "1px solid #F5F7FA",
  },
  coverageText: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#101828",
  },
  complianceBox: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    borderRadius: "10px",
    padding: "18px 24px",
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    boxShadow: "0 2px 8px rgba(16, 24, 40, 0.04)",
  },
  complianceText: {
    fontSize: "13.5px",
    color: "#536273",
    lineHeight: 1.55,
  },
  complianceTitle: {
    color: "#172554",
    fontWeight: "700",
  },
};
