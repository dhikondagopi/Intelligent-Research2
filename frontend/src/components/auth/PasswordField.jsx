import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function PasswordField({
  id,
  name,
  label = "Password",
  value,
  onChange,
  placeholder = "••••••••",
  error = null,
  required = true,
  disabled = false,
  autoComplete = "current-password",
  showStrength = false,
  forgotPasswordAction = null,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Compute basic password strength (for signup feedback)
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, text: "", color: "#202A38" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, text: "Weak", color: "#E05B61" };
    if (score === 2) return { score: 2, text: "Fair", color: "#D9A441" };
    if (score === 3) return { score: 3, text: "Good", color: "#4C8DFF" };
    return { score: 4, text: "Strong", color: "#35C98A" };
  };

  const strength = showStrength ? calculateStrength(value) : null;

  return (
    <div style={styles.container}>
      <div style={styles.labelRow}>
        <label htmlFor={id} style={styles.label}>
          {label}
          {required && <span style={styles.requiredMark} aria-hidden="true">*</span>}
        </label>
        {forgotPasswordAction}
      </div>

      <div
        style={{
          ...styles.inputWrapper,
          borderColor: error ? "#E05B61" : isFocused ? "#4C8DFF" : "#202A38",
          boxShadow: isFocused
            ? error
              ? "0 0 0 3px rgba(224, 91, 97, 0.15)"
              : "0 0 0 3px rgba(76, 141, 255, 0.15)"
            : "none",
          backgroundColor: disabled ? "#0B0F17" : "#151D29",
          opacity: disabled ? 0.65 : 1,
        }}
      >
        <div style={styles.iconBox} aria-hidden="true">
          <Lock size={16} color={error ? "#E05B61" : isFocused ? "#4C8DFF" : "#98A4B5"} />
        </div>

        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : showStrength ? `${id}-strength` : undefined}
          style={styles.input}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={styles.toggleButton}
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={0}
        >
          {showPassword ? (
            <EyeOff size={16} color="#98A4B5" />
          ) : (
            <Eye size={16} color="#98A4B5" />
          )}
        </button>
      </div>

      {showStrength && value && (
        <div id={`${id}-strength`} style={styles.strengthRow}>
          <div style={styles.strengthBars}>
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                style={{
                  ...styles.strengthBar,
                  backgroundColor: level <= strength.score ? strength.color : "#202A38",
                }}
              />
            ))}
          </div>
          <span style={{ ...styles.strengthLabel, color: strength.color }}>
            {strength.text}
          </span>
        </div>
      )}

      {error && (
        <div id={`${id}-error`} style={styles.errorMessage} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#F2F5F8",
    display: "flex",
    alignItems: "center",
    gap: "3px",
  },
  requiredMark: {
    color: "#E05B61",
    fontSize: "14px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease",
  },
  iconBox: {
    position: "absolute",
    left: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    height: "40px",
    paddingLeft: "38px",
    paddingRight: "40px",
    backgroundColor: "transparent",
    border: "none",
    color: "#F2F5F8",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    borderRadius: "8px",
  },
  toggleButton: {
    position: "absolute",
    right: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    padding: 0,
    transition: "background-color 0.15s ease",
  },
  strengthRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginTop: "2px",
  },
  strengthBars: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flex: 1,
  },
  strengthBar: {
    height: "3px",
    flex: 1,
    borderRadius: "2px",
    transition: "background-color 0.2s ease",
  },
  strengthLabel: {
    fontSize: "11px",
    fontWeight: "600",
  },
  errorMessage: {
    fontSize: "12px",
    color: "#E05B61",
    lineHeight: 1.3,
  },
};
