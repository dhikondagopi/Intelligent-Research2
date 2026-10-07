import { Link } from "react-router-dom";
import {
  BookOpen,
  DollarSign,
  FileText,
  Cpu,
  Sparkles,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Search,
  Award,
  Layers,
  Percent,
  Compass,
} from "lucide-react";

export default function FeatureSection() {
  return (
    <div id="platform">
      {/* 1. RESEARCH INTELLIGENCE */}
      <section style={styles.featureSection} aria-label="Research Intelligence">
        <div style={styles.container}>
          <div style={styles.editorialGrid}>
            <div style={styles.editorialTextCol}>
              <span style={styles.sectionKicker}>Research Intelligence</span>
              <h2 style={styles.featureTitle}>
                Transform research data into intelligence
              </h2>
              <p style={styles.featureDescription}>
                Go beyond manual literature reviews. Intelligent Research indexes scientific output across disciplines to illuminate publication velocity, influential citations, emerging clusters, and collaboration networks.
              </p>

              <div style={styles.capabilitiesList}>
                <div style={styles.capabilityItem}>
                  <CheckCircle2 size={16} color="#2F6FED" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={styles.capStrong}>Research Discovery:</strong> Semantic natural-language retrieval indexing across global scientific repositories.
                  </div>
                </div>
                <div style={styles.capabilityItem}>
                  <CheckCircle2 size={16} color="#2F6FED" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={styles.capStrong}>Trend Analysis:</strong> Measure year-over-year publishing trajectories and momentum indicators.
                  </div>
                </div>
                <div style={styles.capabilityItem}>
                  <CheckCircle2 size={16} color="#2F6FED" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={styles.capStrong}>Emerging Topics & Hotspots:</strong> Detect fast-moving subdisciplines before they hit peak conference visibility.
                  </div>
                </div>
                <div style={styles.capabilityItem}>
                  <CheckCircle2 size={16} color="#2F6FED" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={styles.capStrong}>Citation Analytics:</strong> Distinguish foundational citations from perfunctory mentions.
                  </div>
                </div>
              </div>

              <div style={styles.ctaRow}>
                <Link to="/register" style={styles.featureCta}>
                  <span>Explore Research Intelligence</span>
                  <ArrowRight size={14} style={{ marginLeft: 6 }} />
                </Link>
              </div>
            </div>

            {/* Research Preview UI Card */}
            <div style={styles.uiPreviewCol}>
              <div style={styles.previewCard}>
                <div style={styles.previewHeader}>
                  <div style={styles.previewHeaderLeft}>
                    <BookOpen size={16} color="#2F6FED" />
                    <span style={styles.previewHeaderTitle}>Publication Velocity & Hotspot Analysis</span>
                  </div>
                  <span style={styles.previewBadge}>OpenAlex Sync</span>
                </div>

                <div style={styles.previewBody}>
                  <div style={styles.statMiniGrid}>
                    <div style={styles.statMiniCard}>
                      <span style={styles.statMiniNum}>+42.8%</span>
                      <span style={styles.statMiniLabel}>Citation Velocity</span>
                    </div>
                    <div style={styles.statMiniCard}>
                      <span style={styles.statMiniNum}>3,840</span>
                      <span style={styles.statMiniLabel}>Peer Publications</span>
                    </div>
                    <div style={styles.statMiniCard}>
                      <span style={styles.statMiniNum}>0.84</span>
                      <span style={styles.statMiniLabel}>Field Impact Index</span>
                    </div>
                  </div>

                  {/* Representative Research Item */}
                  <div style={styles.representativeItem}>
                    <div style={styles.repTop}>
                      <span style={styles.repTag}>Artificial Intelligence • Health</span>
                      <span style={styles.repDate}>2025-2026 Index</span>
                    </div>
                    <h4 style={styles.repTitle}>
                      Multimodal Foundation Models in Targeted Oncological Therapeutics
                    </h4>
                    <p style={styles.repAuthors}>
                      Vance, E., Chen, K., Al-Mansoor, R. et al. — Nature Biotechnology
                    </p>
                    <div style={styles.repFooter}>
                      <span style={styles.repMetric}>Citations: 284</span>
                      <span style={styles.repMetric}>Momentum: High Velocity</span>
                      <span style={styles.repMetric}>FWCI: 3.42</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FUNDING INTELLIGENCE */}
      <section style={{ ...styles.featureSection, backgroundColor: "#F5F7FA" }} aria-label="Funding Intelligence">
        <div style={styles.container}>
          <div style={{ ...styles.editorialGrid, direction: "rtl" }}>
            <div style={{ ...styles.editorialTextCol, direction: "ltr" }}>
              <span style={styles.sectionKicker}>Funding Intelligence</span>
              <h2 style={styles.featureTitle}>
                Find funding that fits your research
              </h2>
              <p style={styles.featureDescription}>
                Accelerate grant discovery with algorithmic opportunity matching. Aggregate federal award histories from NIH, NSF, DOE, and private foundations, with proactive alignment scores for research objectives.
              </p>

              <div style={styles.capabilitiesList}>
                <div style={styles.capabilityItem}>
                  <CheckCircle2 size={16} color="#2F6FED" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={styles.capStrong}>Funding Discovery:</strong> Active multi-agency grants mapped to investigator domains.
                  </div>
                </div>
                <div style={styles.capabilityItem}>
                  <CheckCircle2 size={16} color="#2F6FED" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={styles.capStrong}>Eligibility Matching:</strong> Instant verification of institutional and investigator constraints.
                  </div>
                </div>
                <div style={styles.capabilityItem}>
                  <CheckCircle2 size={16} color="#2F6FED" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={styles.capStrong}>Recommendation Scoring:</strong> Algorithmic fit percentage derived from past grant wins.
                  </div>
                </div>
                <div style={styles.capabilityItem}>
                  <CheckCircle2 size={16} color="#2F6FED" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={styles.capStrong}>Funding Alerts:</strong> Real-time notices for newly published agency solicitations.
                  </div>
                </div>
              </div>

              <div style={styles.ctaRow}>
                <Link to="/register" style={styles.featureCta}>
                  <span>Explore Funding Intelligence</span>
                  <ArrowRight size={14} style={{ marginLeft: 6 }} />
                </Link>
              </div>
            </div>

            {/* Funding Match Card UI Preview */}
            <div style={{ ...styles.uiPreviewCol, direction: "ltr" }}>
              <div style={styles.previewCard}>
                <div style={styles.previewHeader}>
                  <div style={styles.previewHeaderLeft}>
                    <DollarSign size={16} color="#2F6FED" />
                    <span style={styles.previewHeaderTitle}>Example Funding Match</span>
                  </div>
                  <span style={styles.matchScoreBadge}>94% Match</span>
                </div>

                <div style={styles.previewBody}>
                  <div style={styles.fundingCardContent}>
                    <div style={styles.fundingAgencyRow}>
                      <span style={styles.agencyBadge}>NIH RePORTER</span>
                      <span style={styles.awardType}>R01 Research Project Grant</span>
                    </div>
                    <h4 style={styles.fundingTitle}>
                      Scalable Computational Genomic Architectures for Novel Pathogen Discovery
                    </h4>
                    <div style={styles.fundingDetailsGrid}>
                      <div>
                        <span style={styles.detailLabel}>Estimated Award</span>
                        <strong style={styles.detailValue}>$1,850,000</strong>
                      </div>
                      <div>
                        <span style={styles.detailLabel}>Duration</span>
                        <strong style={styles.detailValue}>4 Years</strong>
                      </div>
                      <div>
                        <span style={styles.detailLabel}>Eligibility</span>
                        <strong style={styles.detailValue}>Higher Ed / Non-Profit</strong>
                      </div>
                      <div>
                        <span style={styles.detailLabel}>Solicitation Status</span>
                        <strong style={{ ...styles.detailValue, color: "#2F6FED" }}>Active Solicitation</strong>
                      </div>
                    </div>
                    <div style={styles.fundingFitBar}>
                      <div style={styles.fitBarTrack}>
                        <div style={{ ...styles.fitBarFill, width: "94%" }} />
                      </div>
                      <span style={styles.fitBarText}>High alignment with investigator published bibliometrics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PATENT + TECHNOLOGY INTELLIGENCE */}
      <section style={styles.featureSection} aria-label="Patent and Technology Intelligence">
        <div style={styles.container}>
          <div style={styles.editorialGrid}>
            <div style={styles.editorialTextCol}>
              <span style={styles.sectionKicker}>Patent & Technology Intelligence</span>
              <h2 style={styles.featureTitle}>
                See where technology is moving
              </h2>
              <p style={styles.featureDescription}>
                Direct integration with USPTO data and WIPO classification systems. Map competitive patent landscapes, monitor corporate assignee filings, identify whitespace claims, and track technology readiness levels (TRL).
              </p>

              <div style={styles.capabilitiesList}>
                <div style={styles.capabilityItem}>
                  <CheckCircle2 size={16} color="#2F6FED" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={styles.capStrong}>Patent Landscapes:</strong> Macro distribution across international patent classifications and WIPO fields.
                  </div>
                </div>
                <div style={styles.capabilityItem}>
                  <CheckCircle2 size={16} color="#2F6FED" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={styles.capStrong}>Competitor & Assignee Analysis:</strong> Track institutional patent portfolios and co-inventorship.
                  </div>
                </div>
                <div style={styles.capabilityItem}>
                  <CheckCircle2 size={16} color="#2F6FED" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={styles.capStrong}>Technology Maturity (TRL):</strong> Benchmark technologies along the 9-point NASA/DoD readiness curve.
                  </div>
                </div>
                <div style={styles.capabilityItem}>
                  <CheckCircle2 size={16} color="#2F6FED" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={styles.capStrong}>Whitespace Discovery:</strong> Pinpoint under-patented intersections between scientific papers and commercial claims.
                  </div>
                </div>
              </div>

              <div style={styles.ctaRow}>
                <Link to="/register" style={styles.featureCta}>
                  <span>Explore Patent Intelligence</span>
                  <ArrowRight size={14} style={{ marginLeft: 6 }} />
                </Link>
              </div>
            </div>

            {/* Patent Landscape Preview Card */}
            <div style={styles.uiPreviewCol}>
              <div style={styles.previewCard}>
                <div style={styles.previewHeader}>
                  <div style={styles.previewHeaderLeft}>
                    <FileText size={16} color="#2F6FED" />
                    <span style={styles.previewHeaderTitle}>USPTO Technology Landscape</span>
                  </div>
                  <span style={styles.previewBadge}>325k+ Patents</span>
                </div>

                <div style={styles.previewBody}>
                  <div style={styles.landscapeBarList}>
                    <div style={styles.landscapeBarItem}>
                      <div style={styles.landscapeBarMeta}>
                        <span style={styles.landscapeField}>Computer Technology</span>
                        <span style={styles.landscapePercent}>28.4% (92,534 patents)</span>
                      </div>
                      <div style={styles.landscapeBarTrack}>
                        <div style={{ ...styles.landscapeBarFill, width: "72%" }} />
                      </div>
                    </div>

                    <div style={styles.landscapeBarItem}>
                      <div style={styles.landscapeBarMeta}>
                        <span style={styles.landscapeField}>Digital Communication</span>
                        <span style={styles.landscapePercent}>18.2% (59,300 patents)</span>
                      </div>
                      <div style={styles.landscapeBarTrack}>
                        <div style={{ ...styles.landscapeBarFill, width: "52%" }} />
                      </div>
                    </div>

                    <div style={styles.landscapeBarItem}>
                      <div style={styles.landscapeBarMeta}>
                        <span style={styles.landscapeField}>Medical Technology</span>
                        <span style={styles.landscapePercent}>14.6% (47,570 patents)</span>
                      </div>
                      <div style={styles.landscapeBarTrack}>
                        <div style={{ ...styles.landscapeBarFill, width: "42%" }} />
                      </div>
                    </div>

                    <div style={styles.landscapeBarItem}>
                      <div style={styles.landscapeBarMeta}>
                        <span style={styles.landscapeField}>Biotechnology</span>
                        <span style={styles.landscapePercent}>11.8% (38,447 patents)</span>
                      </div>
                      <div style={styles.landscapeBarTrack}>
                        <div style={{ ...styles.landscapeBarFill, width: "34%" }} />
                      </div>
                    </div>
                  </div>

                  <div style={styles.trlBadgeRow}>
                    <span style={styles.trlTag}>Current Median Maturity: TRL 5 (System Validation in Relevant Environment)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INNOVATION SCORING */}
      <section style={{ ...styles.featureSection, backgroundColor: "#F5F7FA" }} aria-label="Innovation Scoring">
        <div style={styles.container}>
          <div style={{ ...styles.editorialGrid, direction: "rtl" }}>
            <div style={{ ...styles.editorialTextCol, direction: "ltr" }}>
              <span style={styles.sectionKicker}>Innovation Scoring</span>
              <h2 style={styles.featureTitle}>
                Turn evidence into innovation insight
              </h2>
              <p style={styles.featureDescription}>
                Avoid qualitative guesswork. Intelligent Research applies a multi-dimensional, empirical scoring rubric to synthesize scholarly novelty, IP protection strength, technological maturity, and market demand.
              </p>

              {/* Exact Formula Breakdown */}
              <div style={styles.scoringFormulaBox}>
                <div style={styles.formulaHeader}>
                  <Percent size={14} color="#2F6FED" />
                  <span>Platform Composite Scoring Rubric</span>
                </div>
                <div style={styles.formulaGrid}>
                  <div style={styles.formulaItem}>
                    <span style={styles.formulaWeight}>30%</span>
                    <span style={styles.formulaLabel}>Research Novelty</span>
                  </div>
                  <div style={styles.formulaItem}>
                    <span style={styles.formulaWeight}>20%</span>
                    <span style={styles.formulaLabel}>Patent Strength</span>
                  </div>
                  <div style={styles.formulaItem}>
                    <span style={styles.formulaWeight}>15%</span>
                    <span style={styles.formulaLabel}>Technology Maturity</span>
                  </div>
                  <div style={styles.formulaItem}>
                    <span style={styles.formulaWeight}>20%</span>
                    <span style={styles.formulaLabel}>Market Potential</span>
                  </div>
                  <div style={styles.formulaItem}>
                    <span style={styles.formulaWeight}>15%</span>
                    <span style={styles.formulaLabel}>Funding Relevance</span>
                  </div>
                </div>
              </div>

              <div style={styles.ctaRow}>
                <Link to="/register" style={styles.featureCta}>
                  <span>Explore Innovation Scoring</span>
                  <ArrowRight size={14} style={{ marginLeft: 6 }} />
                </Link>
              </div>
            </div>

            {/* Score Visualization Card */}
            <div style={{ ...styles.uiPreviewCol, direction: "ltr" }}>
              <div style={styles.previewCard}>
                <div style={styles.previewHeader}>
                  <div style={styles.previewHeaderLeft}>
                    <Sparkles size={16} color="#2F6FED" />
                    <span style={styles.previewHeaderTitle}>Example Innovation Index</span>
                  </div>
                  <span style={styles.previewScorePill}>Score: 88.4 / 100</span>
                </div>

                <div style={styles.previewBody}>
                  <div style={styles.scoreRow}>
                    <div style={styles.scoreMeta}>
                      <span style={styles.scoreCategory}>Research Novelty (Weight: 30%)</span>
                      <span style={styles.scoreNumber}>92 / 100</span>
                    </div>
                    <div style={styles.scoreTrack}><div style={{ ...styles.scoreFill, width: "92%" }} /></div>
                  </div>

                  <div style={styles.scoreRow}>
                    <div style={styles.scoreMeta}>
                      <span style={styles.scoreCategory}>Patent Strength (Weight: 20%)</span>
                      <span style={styles.scoreNumber}>84 / 100</span>
                    </div>
                    <div style={styles.scoreTrack}><div style={{ ...styles.scoreFill, width: "84%" }} /></div>
                  </div>

                  <div style={styles.scoreRow}>
                    <div style={styles.scoreMeta}>
                      <span style={styles.scoreCategory}>Technology Maturity (Weight: 15%)</span>
                      <span style={styles.scoreNumber}>78 / 100</span>
                    </div>
                    <div style={styles.scoreTrack}><div style={{ ...styles.scoreFill, width: "78%" }} /></div>
                  </div>

                  <div style={styles.scoreRow}>
                    <div style={styles.scoreMeta}>
                      <span style={styles.scoreCategory}>Market Potential (Weight: 20%)</span>
                      <span style={styles.scoreNumber}>90 / 100</span>
                    </div>
                    <div style={styles.scoreTrack}><div style={{ ...styles.scoreFill, width: "90%" }} /></div>
                  </div>

                  <div style={styles.scoreRow}>
                    <div style={styles.scoreMeta}>
                      <span style={styles.scoreCategory}>Funding Relevance (Weight: 15%)</span>
                      <span style={styles.scoreNumber}>95 / 100</span>
                    </div>
                    <div style={styles.scoreTrack}><div style={{ ...styles.scoreFill, width: "95%" }} /></div>
                  </div>

                  <div style={styles.verdictBox}>
                    <strong style={styles.verdictStrong}>Recommendation: </strong>
                    <span style={styles.verdictText}>Tier 1 Commercialization Candidate. Defensible prior-art with immediate non-dilutive SBIR Phase II alignment.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMMERCIALIZATION PATHWAYS */}
      <section style={styles.featureSection} aria-label="Commercialization Pathways">
        <div style={styles.container}>
          <div style={styles.centerHeader}>
            <span style={styles.sectionKicker}>Commercialization Execution</span>
            <h2 style={styles.featureTitle}>
              From research to real-world impact
            </h2>
            <p style={styles.featureDescriptionCenter}>
              Evidence-based pathways tailored to technological readiness, institutional constraints, and commercial landscape dynamics.
            </p>
          </div>

          <div style={styles.pathwayGrid}>
            <div style={styles.pathwayCard}>
              <div style={styles.pathwayIconBox}><Layers size={20} color="#2F6FED" /></div>
              <h3 style={styles.pathwayTitle}>Productization</h3>
              <p style={styles.pathwayDesc}>
                Direct development into standalone commercial solutions when patent defensibility and market readiness (TRL 7+) are mature.
              </p>
              <div style={styles.pathwayHighlight}>Best for: Mature software, clinical diagnostics & consumer IP</div>
            </div>

            <div style={styles.pathwayCard}>
              <div style={styles.pathwayIconBox}><FileText size={20} color="#2F6FED" /></div>
              <h3 style={styles.pathwayTitle}>Licensing</h3>
              <p style={styles.pathwayDesc}>
                Technology transfer to established industrial operators with existing manufacturing, clinical trial, or distribution moats.
              </p>
              <div style={styles.pathwayHighlight}>Best for: High-capex hardware, pharmaceuticals & materials</div>
            </div>

            <div style={styles.pathwayCard}>
              <div style={styles.pathwayIconBox}><TrendingUp size={20} color="#2F6FED" /></div>
              <h3 style={styles.pathwayTitle}>Startup Creation</h3>
              <p style={styles.pathwayDesc}>
                New venture spinout formation backed by non-dilutive agency grants and venture capital syndicate interest.
              </p>
              <div style={styles.pathwayHighlight}>Best for: High-growth platform technologies & deep tech</div>
            </div>

            <div style={styles.pathwayCard}>
              <div style={styles.pathwayIconBox}><Compass size={20} color="#2F6FED" /></div>
              <h3 style={styles.pathwayTitle}>Industry Partnership</h3>
              <p style={styles.pathwayDesc}>
                Sponsored research agreements and co-development consortiums with enterprise R&D departments.
              </p>
              <div style={styles.pathwayHighlight}>Best for: Pre-competitive discovery & joint testing</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  featureSection: {
    padding: "88px 24px",
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #D9E0EA",
  },
  container: {
    maxWidth: "1240px",
    margin: "0 auto",
  },
  editorialGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: "56px",
    alignItems: "center",
  },
  editorialTextCol: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionKicker: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#2F6FED",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  featureTitle: {
    fontSize: "clamp(26px, 3.4vw, 38px)",
    fontWeight: "800",
    color: "#101828",
    letterSpacing: "-0.03em",
    lineHeight: 1.2,
    margin: 0,
  },
  featureDescription: {
    fontSize: "16px",
    color: "#536273",
    lineHeight: 1.6,
    margin: 0,
  },
  capabilitiesList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "8px",
    marginBottom: "12px",
  },
  capabilityItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    fontSize: "14px",
    color: "#536273",
    lineHeight: 1.5,
  },
  capStrong: {
    color: "#101828",
    fontWeight: "600",
  },
  ctaRow: {
    marginTop: "12px",
  },
  featureCta: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    color: "#2F6FED",
    border: "1px solid #D9E0EA",
    padding: "10px 20px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
    transition: "all 0.15s ease",
  },
  uiPreviewCol: {
    width: "100%",
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(16, 24, 40, 0.06)",
    overflow: "hidden",
  },
  previewHeader: {
    backgroundColor: "#F5F7FA",
    borderBottom: "1px solid #D9E0EA",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  previewHeaderTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#101828",
  },
  previewBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#536273",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    padding: "2px 8px",
    borderRadius: "4px",
  },
  previewBody: {
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  statMiniGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  statMiniCard: {
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    borderRadius: "6px",
    padding: "10px 12px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
  },
  statMiniNum: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#172554",
  },
  statMiniLabel: {
    fontSize: "11px",
    color: "#536273",
    fontWeight: "500",
  },
  representativeItem: {
    border: "1px solid #D9E0EA",
    borderRadius: "8px",
    padding: "16px",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  repTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "11px",
    color: "#536273",
  },
  repTag: {
    color: "#2F6FED",
    fontWeight: "600",
  },
  repDate: {
    color: "#536273",
  },
  repTitle: {
    fontSize: "14.5px",
    fontWeight: "700",
    color: "#101828",
    margin: 0,
    lineHeight: 1.35,
  },
  repAuthors: {
    fontSize: "12px",
    color: "#536273",
    margin: 0,
  },
  repFooter: {
    display: "flex",
    gap: "12px",
    marginTop: "6px",
    paddingTop: "10px",
    borderTop: "1px solid #F5F7FA",
    fontSize: "11.5px",
    color: "#101828",
    fontWeight: "600",
  },
  repMetric: {
    display: "inline-flex",
  },
  matchScoreBadge: {
    backgroundColor: "#2F6FED",
    color: "#FFFFFF",
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  fundingCardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  fundingAgencyRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  agencyBadge: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#172554",
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    padding: "2px 8px",
    borderRadius: "4px",
  },
  awardType: {
    fontSize: "12px",
    color: "#536273",
    fontWeight: "500",
  },
  fundingTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#101828",
    lineHeight: 1.35,
    margin: 0,
  },
  fundingDetailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    backgroundColor: "#F5F7FA",
    padding: "12px 14px",
    borderRadius: "6px",
    border: "1px solid #D9E0EA",
  },
  detailLabel: {
    fontSize: "11px",
    color: "#536273",
    display: "block",
  },
  detailValue: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#101828",
  },
  fundingFitBar: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  fitBarTrack: {
    width: "100%",
    height: "6px",
    backgroundColor: "#D9E0EA",
    borderRadius: "3px",
    overflow: "hidden",
  },
  fitBarFill: {
    height: "100%",
    backgroundColor: "#2F6FED",
    borderRadius: "3px",
  },
  fitBarText: {
    fontSize: "11px",
    color: "#536273",
  },
  landscapeBarList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  landscapeBarItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  landscapeBarMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
  },
  landscapeField: {
    fontWeight: "600",
    color: "#101828",
  },
  landscapePercent: {
    color: "#536273",
    fontWeight: "500",
  },
  landscapeBarTrack: {
    width: "100%",
    height: "6px",
    backgroundColor: "#F5F7FA",
    borderRadius: "3px",
    border: "1px solid #D9E0EA",
    overflow: "hidden",
  },
  landscapeBarFill: {
    height: "100%",
    backgroundColor: "#2F6FED",
    borderRadius: "3px",
  },
  trlBadgeRow: {
    backgroundColor: "rgba(47, 111, 237, 0.08)",
    border: "1px solid rgba(47, 111, 237, 0.2)",
    borderRadius: "6px",
    padding: "10px 12px",
  },
  trlTag: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#172554",
  },
  scoringFormulaBox: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    borderRadius: "10px",
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  formulaHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#172554",
    textTransform: "uppercase",
  },
  formulaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "8px",
  },
  formulaItem: {
    backgroundColor: "#F5F7FA",
    borderRadius: "6px",
    padding: "8px 10px",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #D9E0EA",
  },
  formulaWeight: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#2F6FED",
  },
  formulaLabel: {
    fontSize: "11px",
    color: "#536273",
    fontWeight: "500",
  },
  previewScorePill: {
    backgroundColor: "rgba(47, 111, 237, 0.1)",
    border: "1px solid rgba(47, 111, 237, 0.25)",
    color: "#2F6FED",
    fontSize: "12px",
    fontWeight: "700",
    padding: "3px 9px",
    borderRadius: "4px",
  },
  scoreRow: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  scoreMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
  },
  scoreCategory: {
    color: "#101828",
    fontWeight: "600",
  },
  scoreNumber: {
    color: "#536273",
    fontWeight: "700",
  },
  scoreTrack: {
    width: "100%",
    height: "6px",
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    borderRadius: "3px",
    overflow: "hidden",
  },
  scoreFill: {
    height: "100%",
    backgroundColor: "#2F6FED",
    borderRadius: "3px",
  },
  verdictBox: {
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    borderRadius: "6px",
    padding: "10px 14px",
    fontSize: "12.5px",
    lineHeight: 1.45,
  },
  verdictStrong: {
    color: "#172554",
    fontWeight: "700",
  },
  verdictText: {
    color: "#536273",
  },
  centerHeader: {
    textAlign: "center",
    maxWidth: "760px",
    margin: "0 auto 52px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  featureDescriptionCenter: {
    fontSize: "16px",
    color: "#536273",
    lineHeight: 1.55,
    margin: 0,
  },
  pathwayGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },
  pathwayCard: {
    backgroundColor: "#F5F7FA",
    border: "1px solid #D9E0EA",
    borderRadius: "10px",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    transition: "box-shadow 0.15s ease",
  },
  pathwayIconBox: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D9E0EA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pathwayTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#101828",
    margin: 0,
  },
  pathwayDesc: {
    fontSize: "13.5px",
    color: "#536273",
    lineHeight: 1.5,
    margin: 0,
    flex: 1,
  },
  pathwayHighlight: {
    fontSize: "11.5px",
    color: "#2F6FED",
    fontWeight: "600",
    paddingTop: "8px",
    borderTop: "1px solid #D9E0EA",
  },
};
