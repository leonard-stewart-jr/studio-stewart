import React from "react";

// Gradients and stroke for each mode
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

const NAVBAR_HEIGHT = 76; // px

export default function BottomModeNav({ active, onChange }) {
  // Responsive font size
  const isMobile = typeof window !== "undefined" && window.innerWidth < 700;
  const fontSize = isMobile ? 27 : 40; // px

  // Find the max label width
  const labelValues = Object.values(MODE_LABELS);
  const maxLabelLength = Math.max(...labelValues.map(label => label.length));
  const approxCharWidth = fontSize * 0.68;
  const svgWidth = Math.ceil(maxLabelLength * approxCharWidth) + 24; // 24px for right padding
  const svgHeight = Math.ceil(fontSize * 1.39);

  // Padding for the left edge (add 50px here)
  const leftPadding = 50;
  const leftX = leftPadding;
  const centerY = svgHeight / 2 + fontSize / 2.8;

  // Spacing: Double the previous gap (was svgHeight + 50)
  const gap = (svgHeight + 50) * 2;

  // Calculate vertical margin
  const navHeightPx = typeof window !== "undefined" ? window.innerHeight - NAVBAR_HEIGHT : 900 - NAVBAR_HEIGHT;
  const totalButtonsHeight = svgHeight * 3 + gap * 2;
  const verticalMargin = Math.max((navHeightPx - totalButtonsHeight) / 2, 24);

  // Glow/scale for active
  const activeGlow = "0 0 24px 6px #e6dbb999, 0 0 0px 2px #fff";
  const activeScale = 1.18;
  const inactiveScale = 1;

  const modes = ["world", "usa", "sd"];

  return (
    <nav
      aria-label="View mode switcher"
      style={{
        position: "fixed",
        left: 0,
        top: NAVBAR_HEIGHT,
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        width: svgWidth + leftPadding,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        background: "transparent",
        pointerEvents: "auto",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div style={{ height: verticalMargin }} />
      {modes.map((mode, idx) => {
        const gradientId = `mode-gradient-${mode}`;
        const { stops, stroke } = MODE_GRADIENTS[mode];
        const label = MODE_LABELS[mode];
        const isActive = active === mode;

        return (
          <React.Fragment key={mode}>
            <button
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
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                width: svgWidth + leftPadding,
                height: svgHeight,
                transition: "transform 0.18s, filter 0.18s",
                opacity: isActive ? 1 : 0.91,
                pointerEvents: isActive ? "none" : "auto",
                userSelect: "none"
              }}
              disabled={isActive}
            >
              <svg
                width={svgWidth + leftPadding}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth + leftPadding} ${svgHeight}`}
                style={{
                  display: "block",
                  margin: 0,
                  overflow: "visible"
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
                  x={leftX}
                  y={centerY}
                  textAnchor="start"
                  dominantBaseline="middle"
                  fontFamily="'coolvetica', 'Bungee Shade', Arial, sans-serif"
                  fontSize={fontSize}
                  fontWeight={700}
                  letterSpacing="0.055em"
                  style={{
                    fill: `url(#${gradientId})`,
                    stroke: stroke,
                    strokeWidth: isActive ? 3.5 : 2.5,
                    paintOrder: "stroke fill",
                    filter: isActive
                      ? `drop-shadow(${activeGlow})`
                      : undefined,
                    transition: "stroke-width 0.14s, filter 0.18s, font-size 0.18s, transform 0.18s",
                    transform: `scale(${isActive ? activeScale : inactiveScale})`,
                  }}
                >
                  {label}
                </text>
              </svg>
            </button>
            {idx < modes.length - 1 && <div style={{ height: gap }} />}
          </React.Fragment>
        );
      })}
      <div style={{ height: verticalMargin, flexShrink: 0 }} />
    </nav>
  );
}
