import React from "react";

const MODES = [
  { label: "WORLD", value: "world" },
  { label: "USA", value: "usa" },
  { label: "SD", value: "sd" }
];

export default function BottomModeNav({ active, onChange }) {
  // Constants matching your layout:
  const HEADER_HEIGHT = 76;
  const TABS_HEIGHT = 60;
  const TOP_OFFSET = HEADER_HEIGHT + TABS_HEIGHT; // 136px
  const LEFT_OFFSET = 80; // px from left edge

  // Responsive: on mobile, stack at bottom
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 700;

  if (isMobile) {
    // Mobile: horizontal bar at bottom
    return (
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: 70,
          background: "rgba(255,255,255,0.96)",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
          zIndex: 1200,
          boxShadow: "0 -2px 12px #eee",
        }}
      >
        {MODES.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            style={{
              background: active === mode.value ? "#e6dbb9" : "#fff",
              color: active === mode.value ? "#181818" : "#b1b1ae",
              border: "2px solid #e6dbb9",
              borderRadius: 8,
              padding: "14px 22px",
              fontFamily: "coolvetica, sans-serif",
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: ".09em",
              boxShadow: "0 2px 9px #eee",
              cursor: "pointer",
              outline: "none",
              transition: "background 0.18s, color 0.18s"
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>
    );
  }

  // Desktop: vertical, left-side, 80px from left, below nav/tabs
  return (
    <div
      style={{
        position: "fixed",
        left: LEFT_OFFSET,
        top: TOP_OFFSET,
        height: `calc(100vh - ${TOP_OFFSET}px)`,
        width: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
        alignItems: "center",
        zIndex: 1200,
        background: "none",
        pointerEvents: "auto"
      }}
    >
      {MODES.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          style={{
            background: active === mode.value ? "#e6dbb9" : "#fff",
            color: active === mode.value ? "#181818" : "#b1b1ae",
            border: "2px solid #e6dbb9",
            borderRadius: 8,
            padding: "18px 0",
            width: 60,
            fontFamily: "coolvetica, sans-serif",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: ".09em",
            boxShadow: "0 2px 9px #eee",
            cursor: "pointer",
            outline: "none",
            transition: "background 0.18s, color 0.18s",
            margin: 0
          }}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
