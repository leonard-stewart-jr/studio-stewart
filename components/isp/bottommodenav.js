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
  usa: "USA",
  sd: "SD"
};

export default function BottomModeNav({ active, onChange }) {
  // Responsive font size
  const isMobile = typeof window !== "undefined" && window.innerWidth < 700;
  const fontSize = isMobile ? 48 : 72; // px

  // Fixed SVG width for all buttons (largest label)
  const svgWidth = 240;
  const svgHeight = fontSize * 1.25;

  return (
    <nav
      aria-label="View mode switcher"
      style={{
        position: "fixed",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start", // left align
        gap: 36,
        background: "transparent",
        padding: isMobile ? 8 : 38,
        pointerEvents: "auto"
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
                y={svgHeight / 2 + fontSize / 2.7}
                textAnchor="start"
                dominantBaseline="middle"
                fontFamily="'coolvetica', 'Bungee Shade', Arial, sans-serif"
                fontSize={fontSize}
                fontWeight={700}
                letterSpacing="0.08em"
                style={{
                  fill: `url(#${gradientId})`,
                  stroke: stroke,
                  strokeWidth: isActive ? 4 : 3,
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
