import React from "react";

export default function RibbonTab({
  label = "More",
  onClick,
  style = {},
  color = "#b32c2c",
  width = 42,
  height = 140,
  top = "50%",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "absolute",
        right: -width / 2,
        top: top,
        transform: "translateY(-50%)",
        width: width,
        height: height,
        background: `linear-gradient(180deg, ${color} 90%, #952323 100%)`,
        color: "#fff",
        fontWeight: "700",
        fontSize: 18,
        letterSpacing: ".09em",
        border: "none",
        borderRadius: "21px 21px 18px 18px",
        boxShadow: "0 6px 22px rgba(32,32,32,0.17)",
        cursor: "pointer",
        zIndex: 5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        userSelect: "none",
        transition: "box-shadow 0.18s, background 0.22s",
        ...style,
      }}
      aria-label={label}
      tabIndex={0}
    >
      <span
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          fontFamily: "coolvetica, sans-serif",
          fontSize: "1.2em",
          letterSpacing: "0.12em",
          fontWeight: "bold",
          // REMOVED textTransform: "uppercase"
        }}
      >
        {label}
      </span>
      {/* Little triangle/arrow at bottom for "pull" cue */}
      <span
        style={{
          display: "block",
          margin: "10px auto 0 auto",
          width: "16px",
          height: "16px",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <polygon points="8,14 2,6 14,6" fill="#fff" />
        </svg>
      </span>
    </button>
  );
}
