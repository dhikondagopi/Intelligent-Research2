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
    color: "#98A4B5"
  },
  input: {
    width: "100%",
    background: "#101620",
    border: "1px solid #202A38",
    borderRadius: "8px",
    padding: "11px 36px 11px 40px",
    color: "#F2F5F8",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.2s ease"
  },
  clearBtn: {
    position: "absolute",
    right: "12px",
    background: "transparent",
    border: "none",
    color: "#98A4B5",
    cursor: "pointer",
    padding: "4px"
  },
  button: {
    background: "#4C8DFF",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0 22px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap"
  }
};

export default SearchBar;
