import { useState } from "react";

export default function FormField({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  icon: Icon = null,
  error = null,
  required = false,
  optional = false,
  disabled = false,
  helpText = null,
  autoComplete = undefined,
  maxLength = undefined,
  autoFocus = false,
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="auth-field-group">
      <div className="auth-label-row">
        <label htmlFor={id} className="auth-field-label">
          {label}
          {required && <span className="auth-required-mark" aria-hidden="true">*</span>}
        </label>
        {optional && <span className="auth-optional-tag">Optional</span>}
      </div>

      <div
        className={`auth-input-wrapper ${error ? "has-error" : ""} ${isFocused ? "is-focused" : ""} ${disabled ? "is-disabled" : ""}`}
      >
        {Icon && (
          <div className="auth-input-icon" aria-hidden="true">
            <Icon size={16} />
          </div>
        )}

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          className={`auth-input ${Icon ? "has-icon" : ""}`}
        />
      </div>

      {error ? (
        <div id={`${id}-error`} className="auth-error-message" role="alert">
          {error}
        </div>
      ) : helpText ? (
        <div id={`${id}-help`} className="auth-help-text">
          {helpText}
        </div>
      ) : null}

      <style>{`
        .auth-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .auth-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .auth-field-label {
          font-size: 13px;
          fontWeight: 500;
          color: var(--auth-text);
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .auth-required-mark {
          color: #E05B61;
          font-size: 13px;
        }

        .auth-optional-tag {
          font-size: 11px;
          color: var(--auth-muted);
        }

        .auth-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          border-radius: 8px;
          border: 1px solid var(--auth-border);
          background-color: var(--auth-input-bg);
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
        }

        .auth-input-wrapper.is-focused {
          border-color: var(--auth-primary);
          box-shadow: 0 0 0 3px rgba(76, 141, 255, 0.15);
        }

        .auth-input-wrapper.has-error {
          border-color: #E05B61;
        }

        .auth-input-wrapper.has-error.is-focused {
          box-shadow: 0 0 0 3px rgba(224, 91, 97, 0.15);
        }

        .auth-input-wrapper.is-disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-input-icon {
          position: absolute;
          left: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          color: var(--auth-muted);
        }

        .auth-input-wrapper.is-focused .auth-input-icon {
          color: var(--auth-primary);
        }

        .auth-input-wrapper.has-error .auth-input-icon {
          color: #E05B61;
        }

        .auth-input {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          background: transparent;
          border: none;
          color: var(--auth-text);
          font-size: 14px;
          font-family: inherit;
          outline: none;
          border-radius: 8px;
          box-sizing: border-box;
        }

        .auth-input.has-icon {
          padding-left: 38px;
        }

        .auth-input::placeholder {
          color: var(--auth-muted);
          opacity: 0.8;
        }

        .auth-error-message {
          font-size: 12px;
          color: #E05B61;
          line-height: 1.3;
        }

        .auth-help-text {
          font-size: 12px;
          color: var(--auth-muted);
          line-height: 1.3;
        }
      `}</style>
    </div>
  );
}
