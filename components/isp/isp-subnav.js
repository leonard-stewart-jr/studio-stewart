import React from "react";

const TABS = [
  { key: "world", label: "WORLD" },
  { key: "usa", label: "USA" },
  { key: "sd", label: "SOUTH DAKOTA" }
];

export default function ISPSubNav({ active, onChange }) {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 32,
        margin: "32px 0 18px 0",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontWeight: 600,
        fontSize: 14,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        userSelect: "none"
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
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            padding: 0,
            margin: 0,
            position: "relative",
            opacity: active === tab.key ? 1 : 0.93,
            transition: "color 0.2s"
          }}
          disabled={active === tab.key}
          aria-current={active === tab.key ? "page" : undefined}
        >
          {active === tab.key && (
            <span
              style={{
                display: "block",
                width: 7,
                height: 7,
                background: "#e6dbb9",
                borderRadius: 2,
                margin: "0 auto 7px auto",
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: -18
              }}
            />
          )}
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
