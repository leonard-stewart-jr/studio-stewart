import React from "react";

// Define color gradients for each mode
const MODE_GRADIENTS = {
  world: {
    stops: [
      { offset: "0%", color: "#A3B18A" },
      { offset: "40%", color: "#bcb08b" },
      { offset: "80%", color: "#865439" },
      { offset: "100%", color: "#D6C08E" }
    ],
    stroke: "#4C3B26"
  },
  usa: {
    stops: [
      { offset: "0%", color: "#C32B2B" },
      { offset: "40%", color: "#F1F1F1" },
      { offset: "100%", color: "#2E3A87" }
    ],
    stroke: "#222"
  },
  sd: {
    stops: [
      { offset: "0%", color: "#FFE066" },
      { offset: "40%", color: "#A3DAE6" },
      { offset: "80%", color: "#91C499" },
      { offset: "100%", color: "#E6CBA8" }
    ],
    stroke: "#4B3920"
  }
};

const MODE_LABELS = {
  world: "WORLD",
  usa: "UNITED STATES",
  sd: "SOUTH DAKOTA"
};

export default function BottomModeNav({ active, onChange }) {
  // Responsive font size for maximum label ("UNITED STATES"/"SOUTH DAKOTA")
  const isMobile = typeof window !== "undefined" && window.innerWidth < 700;
  // Font size chosen so that "UNITED STATES" and "SOUTH DAKOTA" never overflow
  const fontSize = isMobile ? 28 : 38; // px (can adjust as needed)

  // Compute SVG width to fit the longest word, plus a little padding
  const longestLabel = "UNITED STATES".length > "SOUTH DAKOTA".length ? "UNITED STATES" : "SOUTH DAKOTA";
  const svgWidth = longestLabel.length * fontSize * 0.68 + 24;
  const svgHeight = fontSize * 1.35;

  // For vertical positioning: evenly spaced in thirds between navbar and bottom
  // Assume navbar height is 76px (from your HeaderBar/Layout)
  const navBarHeight = 76;
  const navHeight = svgHeight * 3 + 72; // 3 buttons + gap
  const available = `calc(100vh - ${navBarHeight}px)`;
  // Use flex layout and margins to center the nav in remaining space

  return (
    <nav
      aria-label="View mode switcher"
      style={{
        position: "fixed",
        left: 0,
        top: navBarHeight,
        height: `calc(100vh - ${navBarHeight}px)`,
        width: svgWidth + 54, // move text farther right (increase as needed)
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "0 0 0 32px", // shift text to the right
        background: "transparent",
        pointerEvents: "auto",
        boxSizing: "border-box",
      }}
    >
      {["world", "usa", "sd"].map((mode) => {
        const gradientId = `mode-gradient-${mode}`;
        const { stops, stroke } = MODE_GRADIENTS[mode];
        const label = MODE_LABELS[mode];
        const isActive = active === mode;

        return (
          <button
            key={mode}
            aria-label={label}
            type="button"
            onClick={() => onChange(mode)}
            tabIndex={0}
            style={{
              background: "none",
              border: "none",
              outline: "none",
              boxShadow: "none",
              padding: 0,
              margin: 0,
              cursor: isActive ? "default" : "pointer",
              display: "block",
              width: svgWidth,
              height: svgHeight,
              transition: "transform 0.17s",
              opacity: isActive ? 1 : 0.88,
              pointerEvents: isActive ? "none" : "auto",
              userSelect: "none"
            }}
            disabled={isActive}
          >
            <svg
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{
                display: "block"
              }}
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  {stops.map((stop, i) => (
                    <stop key={i} offset={stop.offset} stopColor={stop.color} />
                  ))}
                </linearGradient>
              </defs>
              <text
                x={0}
                y={svgHeight / 2 + fontSize / 2.8}
                textAnchor="start"
                dominantBaseline="middle"
                fontFamily="'coolvetica', 'Bungee Shade', Arial, sans-serif"
                fontSize={fontSize}
                fontWeight={700}
                letterSpacing="0.06em"
                style={{
                  fill: `url(#${gradientId})`,
                  stroke: stroke,
                  strokeWidth: isActive ? 3.5 : 2.7,
                  paintOrder: "stroke fill",
                  filter: isActive ? "drop-shadow(0 2px 8px #e0dececc)" : undefined,
                  transition: "stroke-width 0.14s, filter 0.18s"
                }}
              >
                {label}
              </text>
            </svg>
          </button>
        );
      })}
    </nav>
  );
}
