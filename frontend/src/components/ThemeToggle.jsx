import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({
  showLabel = true,
  className = "",
  size = "md",
}) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      id="theme-toggle"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${size === "sm" ? "theme-toggle-sm" : ""} ${className}`}
      aria-label={
        isDark
          ? "Switch to light theme (currently dark)"
          : "Switch to dark theme (currently light)"
      }
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <div className="theme-toggle-icon-wrap" aria-hidden="true">
        {isDark ? (
          <Sun size={size === "sm" ? 14 : 15} className="theme-toggle-icon" />
        ) : (
          <Moon size={size === "sm" ? 14 : 15} className="theme-toggle-icon" />
        )}
      </div>
      {showLabel && (
        <span className="theme-toggle-label">
          {isDark ? "Light" : "Dark"}
        </span>
      )}

      <style>{`
        .theme-toggle-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 34px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface);
          color: var(--color-text);
          font-size: 12.5px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
          box-sizing: border-box;
          transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
          flex-shrink: 0;
        }

        .theme-toggle-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .theme-toggle-btn:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }

        .theme-toggle-sm {
          height: 30px;
          padding: 0 8px;
          font-size: 11.5px;
        }

        .theme-toggle-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .theme-toggle-icon {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .theme-toggle-btn:hover .theme-toggle-icon {
          transform: rotate(15deg);
        }

        .theme-toggle-label {
          line-height: 1;
        }
      `}</style>
    </button>
  );
}
