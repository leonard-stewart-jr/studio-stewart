import React from "react";

const TABS = [
  { key: "world", label: "WORLD" },
  { key: "usa", label: "USA" },
  { key: "sd", label: "SOUTH DAKOTA" }
];

// Banner height (half of header, which is 76px)
const SUBNAV_BANNER_HEIGHT = 38;

export default function ISPSubNav({ active, onChange }) {
  return (
    <div
      style={{
        width: "100%",
        background: "#fff",
        position: "sticky",
        top: 76, // main header height
        zIndex: 1201, // above sliding sheet and globe/maps
        height: SUBNAV_BANNER_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 6px 0 rgba(0,0,0,0.04)",
      }}
    >
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 48,
          width: "100%",
          height: "100%",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          userSelect: "none",
        }}
        aria-label="ISP timeline navigation"
      >
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            type="button"
            style={{
              background: "none",
              border: "none",
              outline: "none",
              cursor: active === tab.key ? "default" : "pointer",
              color: active === tab.key ? "#e6dbb9" : "#b1b1ae",
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              padding: "0 8px",
              margin: 0,
              position: "relative",
              opacity: active === tab.key ? 1 : 0.93,
              transition: "color 0.2s",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundClip: "padding-box",
            }}
            disabled={active === tab.key}
            aria-current={active === tab.key ? "page" : undefined}
          >
            <span style={{
              borderBottom: active === tab.key ? "3px solid #e6dbb9" : "3px solid transparent",
              paddingBottom: 4,
              transition: "border-bottom 0.16s",
              display: "inline-block",
              minWidth: 0,
              lineHeight: 1.1,
            }}>
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
