import React from "react";

/**
 * Official "IR" Monogram Emblem
 * Stylized geometric letters with 3D orbital ribbon, glowing node, and ascending analytics bars.
 */
export function LogoSymbol({ size = 36, className = "" }) {
  return (
    <svg
      viewBox="0 0 145 135"
      width={size}
      height={size}
      fill="none"
      className={`ir-brand-symbol ${className}`}
      aria-hidden="true"
      style={{ flexShrink: 0, display: "block" }}
    >
      <defs>
        <linearGradient id="symGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="45%" stopColor="#4C8DFF" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="symOrbit" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#4C8DFF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#9333EA" stopOpacity="0.2" />
        </linearGradient>
        <filter id="symGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Back Trajectory of Orbital Ring */}
      <path
        d="M 125,75 C 135,50 115,35 85,40"
        stroke="url(#symOrbit)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* 'I' Column */}
      <rect x="15" y="25" width="20" height="90" rx="3" fill="url(#symGrad)" filter="url(#symGlow)" />
      <rect x="15" y="25" width="20" height="7" rx="2" fill="#E0F7FF" opacity="0.65" />

      {/* 'R' Structure */}
      <rect x="43" y="25" width="20" height="90" rx="3" fill="url(#symGrad)" />
      <path d="M 63,25 L 98,25 C 118,25 128,38 128,55 C 128,72 116,84 96,84 L 63,84 Z" fill="url(#symGrad)" />
      <path d="M 63,42 L 94,42 C 103,42 108,47 108,55 C 108,62 103,67 94,67 L 63,67 Z" fill="var(--color-bg, #070B12)" />
      <path d="M 84,80 L 112,115 L 132,115 L 102,78 Z" fill="url(#symGrad)" />

      {/* Ascending Analytics Data Bars in Base */}
      <rect x="48" y="96" width="5" height="19" rx="1.5" fill="#00F0FF" />
      <rect x="56" y="90" width="5" height="25" rx="1.5" fill="#38BDF8" />
      <rect x="64" y="82" width="5" height="33" rx="1.5" fill="#60A5FA" />
      <rect x="72" y="74" width="5" height="41" rx="1.5" fill="#818CF8" />

      {/* Front Orbital Ribbon */}
      <path
        d="M 2,86 C 12,108 55,118 100,100 C 130,86 142,66 138,58"
        stroke="url(#symOrbit)"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Orbital Glowing Data Node */}
      <circle cx="106" cy="94" r="5.5" fill="#00F0FF" />
      <circle cx="106" cy="94" r="2.8" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * Official Unified Intelligent Research Logo
 * Variants:
 * 1. "full": Emblem + "Intelligent Research" + "RESEARCH & INNOVATION PLATFORM" subtitle
 * 2. "compact": Emblem + "Intelligent Research"
 * 3. "icon" / "symbol": Emblem only
 */
export default function Logo({
  variant = "full", // "full" | "compact" | "icon" | "symbol"
  size = 36,
  className = "",
  showSubtitle = true,
}) {
  if (variant === "icon" || variant === "symbol") {
    return <LogoSymbol size={size} className={className} />;
  }

  const isFull = variant === "full" && showSubtitle;

  return (
    <div
      className={`ir-brand-lockup ir-brand-${variant} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size > 32 ? "12px" : "9px",
        textDecoration: "none",
        color: "inherit",
        userSelect: "none",
      }}
    >
      <LogoSymbol size={size} />

      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
        {/* Brand Name Typography */}
        <div
          style={{
            fontSize: size > 32 ? "16.5px" : "14.5px",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            display: "inline-flex",
            alignItems: "baseline",
            gap: "4px",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "var(--color-text, #F2F5F8)", transition: "color 0.2s ease" }}>
            Intelligent
          </span>
          <span
            style={{
              background: "linear-gradient(90deg, #00F0FF 0%, #4C8DFF 50%, #C084FC 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 800,
            }}
          >
            Research
          </span>
        </div>

        {/* Subtitle if Full Variant */}
        {isFull && (
          <div
            style={{
              fontSize: size > 32 ? "9.5px" : "8.5px",
              fontWeight: 600,
              letterSpacing: "0.16em",
              color: "var(--color-text-muted, #98A4B5)",
              textTransform: "uppercase",
              marginTop: "2px",
              whiteSpace: "nowrap",
              transition: "color 0.2s ease",
            }}
          >
            RESEARCH &amp; INNOVATION PLATFORM
          </div>
        )}
      </div>
    </div>
  );
}
