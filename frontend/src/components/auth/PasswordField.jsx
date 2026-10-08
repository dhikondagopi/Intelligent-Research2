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

  // Compute password strength if requested
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, text: "", color: "var(--auth-border)" };
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
    <div className="auth-field-group">
      <div className="auth-label-row">
        <label htmlFor={id} className="auth-field-label">
          {label}
          {required && <span className="auth-required-mark" aria-hidden="true">*</span>}
        </label>
        {forgotPasswordAction}
      </div>

      <div
        className={`auth-input-wrapper ${error ? "has-error" : ""} ${isFocused ? "is-focused" : ""} ${disabled ? "is-disabled" : ""}`}
      >
        <div className="auth-input-icon" aria-hidden="true">
          <Lock size={16} />
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
          className="auth-input has-icon has-toggle"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="auth-toggle-btn"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={0}
        >
          {showPassword ? (
            <EyeOff size={16} aria-hidden="true" />
          ) : (
            <Eye size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      {showStrength && value && (
        <div id={`${id}-strength`} className="auth-strength-row">
          <div className="auth-strength-bars">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="auth-strength-bar"
                style={{
                  backgroundColor: level <= strength.score ? strength.color : "var(--auth-border)",
                }}
              />
            ))}
          </div>
          <span className="auth-strength-label" style={{ color: strength.color }}>
            {strength.text}
          </span>
        </div>
      )}

      {error && (
        <div id={`${id}-error`} className="auth-error-message" role="alert">
          {error}
        </div>
      )}

      <style>{`
        .auth-input.has-toggle {
          padding-right: 40px;
        }

        .auth-toggle-btn {
          position: absolute;
          right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--auth-muted);
          cursor: pointer;
          padding: 0;
          transition: color 0.15s ease;
        }

        .auth-toggle-btn:hover {
          color: var(--auth-text);
        }

        .auth-strength-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 2px;
        }

        .auth-strength-bars {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .auth-strength-bar {
          height: 3px;
          flex: 1;
          border-radius: 2px;
          transition: background-color 0.2s ease;
        }

        .auth-strength-label {
          font-size: 11px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
