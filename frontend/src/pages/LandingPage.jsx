import PublicHeader from "../components/public/PublicHeader";
import HeroSection from "../components/public/HeroSection";
import AudienceSection from "../components/public/AudienceSection";
import IntelligenceSection from "../components/public/IntelligenceSection";
import FeatureSection from "../components/public/FeatureSection";
import ProductPreview from "../components/public/ProductPreview";
import HowItWorksSection from "../components/public/HowItWorksSection";
import DataSourcesSection from "../components/public/DataSourcesSection";
import UseCaseSection from "../components/public/UseCaseSection";
import CTASection from "../components/public/CTASection";
import PublicFooter from "../components/public/PublicFooter";
import { ShieldCheck, Target, Award, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div style={styles.pageWrapper}>
      {/* 1. Global Navigation */}
      <PublicHeader />

      {/* 2. Hero Section with Real Metrics & Connected Workflow */}
      <HeroSection />

      {/* 3. Who We Serve (6 Audience Segments) */}
      <AudienceSection />

      {/* 4. Connected Intelligence (Cross-domain Relational Architecture) */}
      <IntelligenceSection />

      {/* 5. Core Capabilities (Research, Funding, Patents, Tech, Innovation, Commercialization) */}
      <FeatureSection />

      {/* 6. Product Previews (Live UI Replica Windows) */}
      <ProductPreview />

      {/* 7. How It Works (4 Steps) */}
      <HowItWorksSection />

      {/* 8. Mission-Critical Workflows & Use Cases */}
      <UseCaseSection />

      {/* 9. Verified Data Sources & Integrity */}
      <DataSourcesSection />

      {/* 10. About Section */}
      <section id="about" style={styles.aboutSection} aria-label="About Intelligent Research">
        <div style={styles.aboutContainer}>
          <div style={styles.aboutHeader}>
            <span style={styles.aboutKicker}>About Our Mission</span>
            <h2 style={styles.aboutTitle}>
              Bridging the gap between scientific discovery and market impact
            </h2>
            <p style={styles.aboutSubtitle}>
              Traditional research databases operate in silos—papers in one tool, grants in another, patents isolated in legal software. Intelligent Research unifies these streams into one coherent, connected intelligence platform.
            </p>
          </div>

          <div style={styles.aboutPillarsGrid}>
            <div style={styles.aboutPillar}>
              <div style={styles.pillarIconBox}>
                <Target size={20} color="#2F6FED" />
              </div>
              <h3 style={styles.pillarTitle}>Empirical Integrity</h3>
              <p style={styles.pillarDesc}>
                We prioritize hard evidence from official repositories (USPTO, NIH, OpenAlex) over speculative AI generation. Every metric is backed by provenance.
              </p>
            </div>

            <div style={styles.aboutPillar}>
              <div style={styles.pillarIconBox}>
                <Award size={20} color="#2F6FED" />
              </div>
              <h3 style={styles.pillarTitle}>Multi-Tenant Privacy</h3>
              <p style={styles.pillarDesc}>
                Institutional research inquiries, unpublished technology disclosures, and grant drafts are encrypted and isolated under zero-trust enterprise security.
              </p>
            </div>

            <div style={styles.aboutPillar}>
              <div style={styles.pillarIconBox}>
                <Users size={20} color="#2F6FED" />
              </div>
              <h3 style={styles.pillarTitle}>Built for Innovators</h3>
              <p style={styles.pillarDesc}>
                Engineered specifically for the collaborative cadence of university faculty, tech transfer officers, deep tech founders, and enterprise R&D directors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Final Call To Action */}
      <CTASection />

      {/* 12. Global Enterprise Footer */}
      <PublicFooter />

      {/* Global Scoped Light Styles for the Public Site */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        /* Responsive layout overrides */
        @media (max-width: 960px) {
          .preview-window-chrome {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: "#FFFFFF",
    color: "#101828",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
  },
  aboutSection: {
    backgroundColor: "#FFFFFF",
    padding: "88px 24px",
    borderBottom: "1px solid #D9E0EA",
  },
  aboutContainer: {
    maxWidth: "1240px",
    margin: "0 auto",
  },
  aboutHeader: {
    textAlign: "center",
    maxWidth: "800px",
    margin: "0 auto 52px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  aboutKicker: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#2F6FED",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  aboutTitle: {
    fontSize: "clamp(26px, 3.4vw, 38px)",
    fontWeight: "800",
    color: "#101828",
    letterSpacing: "-0.03em",
    lineHeight: 1.25,
    margin: 0,
  },
  aboutSubtitle: {
    fontSize: "16px",
    color: "#536273",
    lineHeight: 1.6,
    margin: 0,
  },
  aboutPillarsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "28px",
  },
  aboutPillar: {
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    borderRadius: "10px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  pillarIconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pillarTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#101828",
    margin: 0,
  },
  pillarDesc: {
    fontSize: "14px",
    color: "#536273",
    lineHeight: 1.55,
    margin: 0,
  },
};
