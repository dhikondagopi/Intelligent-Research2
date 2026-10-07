export default function AuthHeader({
  heading,
  subtitle,
  badge = null,
  step = null,
  totalSteps = null,
  onStepClick = null
}) {
  return (
    <div style={styles.header}>
      {/* Optional Top Badge or Step Indicator */}
      <div style={styles.topRow}>
        {badge && (
          <span style={styles.badge}>
            <span style={styles.badgeDot} />
            {badge}
          </span>
        )}

        {step && totalSteps && (
          <div style={styles.stepContainer} aria-label={`Step ${step} of ${totalSteps}`}>
            <span style={styles.stepText}>Step {step} of {totalSteps}</span>
            <div style={styles.stepDots}>
              {Array.from({ length: totalSteps }).map((_, idx) => {
                const stepNum = idx + 1;
                const isCompleted = stepNum < step;
                const isCurrent = stepNum === step;
                return (
                  <button
                    key={stepNum}
                    type="button"
                    onClick={() => onStepClick && onStepClick(stepNum)}
                    disabled={!onStepClick || stepNum > step}
                    title={`Go to step ${stepNum}`}
                    style={{
                      ...styles.dotButton,
                      backgroundColor: isCurrent ? "#4C8DFF" : isCompleted ? "#35C98A" : "#202A38",
                      width: isCurrent ? "20px" : "8px",
                      cursor: onStepClick && stepNum < step ? "pointer" : "default"
                    }}
                    aria-current={isCurrent ? "step" : undefined}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      <h2 style={styles.heading}>{heading}</h2>
      <p style={styles.subtitle}>{subtitle}</p>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: "24px",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
    gap: "12px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "3px 10px",
    borderRadius: "9999px",
    backgroundColor: "rgba(76, 141, 255, 0.1)",
    border: "1px solid rgba(76, 141, 255, 0.25)",
    color: "#4C8DFF",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#4C8DFF",
  },
  stepContainer: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    marginLeft: "auto",
  },
  stepText: {
    fontSize: "12px",
    color: "#98A4B5",
    fontWeight: "500",
  },
  stepDots: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  dotButton: {
    height: "6px",
    borderRadius: "9999px",
    border: "none",
    padding: 0,
    transition: "all 0.25s ease",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#F2F5F8",
    letterSpacing: "-0.02em",
    lineHeight: 1.25,
    margin: 0,
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#98A4B5",
    lineHeight: 1.45,
    margin: 0,
  },
};
