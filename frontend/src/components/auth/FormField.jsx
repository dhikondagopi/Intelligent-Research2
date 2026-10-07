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
    <div style={styles.container}>
      <div style={styles.labelRow}>
        <label htmlFor={id} style={styles.label}>
          {label}
          {required && <span style={styles.requiredMark} aria-hidden="true">*</span>}
        </label>
        {optional && <span style={styles.optionalTag}>Optional</span>}
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
        {Icon && (
          <div style={styles.iconBox} aria-hidden="true">
            <Icon size={16} color={error ? "#E05B61" : isFocused ? "#4C8DFF" : "#98A4B5"} />
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
          style={{
            ...styles.input,
            paddingLeft: Icon ? "38px" : "12px",
          }}
        />
      </div>

      {error ? (
        <div id={`${id}-error`} style={styles.errorMessage} role="alert">
          {error}
        </div>
      ) : helpText ? (
        <div id={`${id}-help`} style={styles.helpText}>
          {helpText}
        </div>
      ) : null}
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
  optionalTag: {
    fontSize: "11px",
    color: "#98A4B5",
    backgroundColor: "rgba(152, 164, 181, 0.1)",
    padding: "1px 6px",
    borderRadius: "4px",
    fontWeight: "400",
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
    paddingRight: "12px",
    backgroundColor: "transparent",
    border: "none",
    color: "#F2F5F8",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    borderRadius: "8px",
  },
  errorMessage: {
    fontSize: "12px",
    color: "#E05B61",
    lineHeight: 1.3,
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  helpText: {
    fontSize: "12px",
    color: "#98A4B5",
    lineHeight: 1.3,
  },
};
