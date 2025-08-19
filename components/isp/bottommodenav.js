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

const NAVBAR_HEIGHT = 76; // px, from your header

export default function BottomModeNav({ active, onChange }) {
  // Responsive font size (decreased for long labels)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 700;
  const fontSize = isMobile ? 27 : 40; // px

  const svgPadding = 24; // px, left-right padding inside SVG for no clipping
  // Calculate the maximum label width
  const labelWidths = Object.values(MODE_LABELS).map(
    label => label.length * fontSize * 0.62
  );
  const maxLabelWidth = Math.max(...labelWidths);
  const svgWidth = Math.ceil(maxLabelWidth + svgPadding * 2);

  const buttonHeight = Math.ceil(fontSize * 1.39);

  // Spacing: 50px extra between each button
  const gap = buttonHeight + 50;

  // Center all words on the same vertical center-line
  const centerX = svgWidth / 2;

  // Height available for the nav (excluding header)
  const navHeight = `calc(100vh - ${NAVBAR_HEIGHT}px)`;

  // For SSR/fallback, default space to 64px if not available
  const navHeightPx = typeof window !== "undefined" ? window.innerHeight - NAVBAR_HEIGHT : 900 - NAVBAR_HEIGHT;
  // 2 gaps, 3 buttons, fill with margin above and below
  const totalButtonsHeight = buttonHeight * 3 + gap * 2;
  const verticalMargin = Math.max((navHeightPx - totalButtonsHeight) / 2, 32);

  // Button order
  const modes = ["world", "usa", "sd"];

  // Glowing/scale effect for active
  const activeGlow = "0 0 24px 6px #e6dbb999, 0 0 0px 2px #fff";
  const activeScale = 1.19;
  const inactiveScale = 1;

  return (
    <nav
      aria-label="View mode switcher"
      style={{
        position: "fixed",
        left: 0,
        top: NAVBAR_HEIGHT,
        height: navHeight,
        width: svgWidth + 30,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        background: "transparent",
        pointerEvents: "auto",
        boxSizing: "border-box",
        overflow: "hidden"
      }}
    >
      {/* Top vertical margin */}
      <div style={{ height: verticalMargin }} />
      {/* MODE BUTTONS */}
      {modes.map((mode, idx) => {
        const gradientId = `mode-gradient-${mode}`;
        const { stops, stroke } = MODE_GRADIENTS[mode];
        const label = MODE_LABELS[mode];
        const isActive = active === mode;
        // Calculate label width for perfect visual centering
        const labelWidth = label.length * fontSize * 0.62;
        // Center X minus half actual label width, so each word is centered on the same line
        const labelX = centerX - labelWidth / 2;

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
                justifyContent: "center",
                width: svgWidth,
                height: buttonHeight,
                transition: "transform 0.18s, filter 0.18s",
                opacity: isActive ? 1 : 0.91,
                pointerEvents: isActive ? "none" : "auto",
                userSelect: "none"
              }}
              disabled={isActive}
            >
              <svg
                width={svgWidth}
                height={buttonHeight}
                viewBox={`0 0 ${svgWidth} ${buttonHeight}`}
                style={{
                  display: "block",
                  marginLeft: 0,
                  marginRight: 0,
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
                  x={labelX}
                  y={buttonHeight / 2 + fontSize / 2.8}
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
            {/* Gap except after last button */}
            {idx < modes.length - 1 && <div style={{ height: gap }} />}
          </React.Fragment>
        );
      })}
      {/* Bottom vertical margin */}
      <div style={{ height: verticalMargin, flexShrink: 0 }} />
    </nav>
  );
}
