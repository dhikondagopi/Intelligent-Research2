import React from "react";
import { Search, X, Sparkles } from "lucide-react";

function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search publications, patents, technologies...",
  loading = false
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputWrapper}>
        <Search size={16} style={styles.icon} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={styles.input}
        />
        {value && (
          <button type="button" onClick={() => onChange("")} style={styles.clearBtn}>
            <X size={14} />
          </button>
        )}
      </div>

      <button type="submit" disabled={loading} style={styles.button}>
        <Sparkles size={15} />
        <span>{loading ? "Searching..." : "Search"}</span>
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    gap: "10px",
    width: "100%"
  },
  inputWrapper: {
    position: "relative",
    flex: 1,
    display: "flex",
    alignItems: "center"
  },
  icon: {
    position: "absolute",
    left: "14px",
    color: "#64748b"
  },
  input: {
    width: "100%",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "11px 36px 11px 40px",
    color: "#f8fafc",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.2s ease"
  },
  clearBtn: {
    position: "absolute",
    right: "12px",
    background: "transparent",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    padding: "4px"
  },
  button: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "0 22px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap"
  }
};

export default SearchBar;
