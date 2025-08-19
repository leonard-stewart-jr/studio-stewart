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

// Layout constants
const NAVBAR_HEIGHT = 76; // px, from your header
const BUTTON_COUNT = 3;

export default function BottomModeNav({ active, onChange }) {
  // Responsive font size (decreased for long labels)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 700;
  const fontSize = isMobile ? 27 : 40; // px

  // Calculate SVG width based on maximum label length, plus padding
  const svgPadding = 18; // px, left-right padding inside SVG
  const buttonWidth = Math.ceil(Math.max(
    ...Object.values(MODE_LABELS).map(label => label.length * fontSize * 0.67)
  )) + svgPadding * 2;

  const buttonHeight = Math.ceil(fontSize * 1.39);

  // Height available for the nav (excluding header)
  const navHeight = `calc(100vh - ${NAVBAR_HEIGHT}px)`;

  // For perfect thirds: 
  // Space above + button1 + gap1 + button2 + gap2 + button3 + space below = navHeight
  // Let space = S, gap = G, button height = H
  // S + H + G + H + G + H + S = navHeight  => 2S + 2G + 3H = navHeight
  // So: S = (navHeight - 3H - 2G) / 2

  // Let's use G = buttonHeight (one full button height as gap)
  const gap = buttonHeight;
  // For CSS calc, must use px
  // space = (navHeight_px - 3*buttonHeight - 2*gap) / 2
  // But navHeight is in CSS calc, so use JS for px value
  const navHeightPx = typeof window !== "undefined" ? window.innerHeight - NAVBAR_HEIGHT : 900 - NAVBAR_HEIGHT;
  const space = Math.max((navHeightPx - BUTTON_COUNT * buttonHeight - 2 * gap) / 2, 0);

  // For SSR/fallback, default space to 48px if negative
  const topSpace = space >= 0 ? space : 48;
  const bottomSpace = topSpace;

  // For the glowing active state
  const activeGlow = "0 0 24px 6px #e6dbb999, 0 0 0px 2px #fff";
  const activeScale = 1.18;
  const inactiveScale = 1;

  // Button order
  const modes = ["world", "usa", "sd"];

  return (
    <nav
      aria-label="View mode switcher"
      style={{
        position: "fixed",
        left: 0,
        top: NAVBAR_HEIGHT,
        height: navHeight,
        width: buttonWidth + 30, // enough for padding and shadow
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        background: "transparent",
        pointerEvents: "auto",
        boxSizing: "border-box",
        // Remove scrolling for nav
        overflow: "hidden"
      }}
    >
      {/* Top space */}
      <div style={{ height: topSpace }} />
      {/* MODE BUTTONS */}
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
                width: buttonWidth,
                height: buttonHeight,
                transition: "transform 0.18s, filter 0.18s",
                opacity: isActive ? 1 : 0.91,
                pointerEvents: isActive ? "none" : "auto",
                userSelect: "none",
                // Center the button's content vertically in its area
              }}
              disabled={isActive}
            >
              <svg
                width={buttonWidth}
                height={buttonHeight}
                viewBox={`0 0 ${buttonWidth} ${buttonHeight}`}
                style={{
                  display: "block",
                  // Center content left, but pad so no clipping
                  marginLeft: 0,
                  marginRight: "auto",
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
                  x={svgPadding}
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
            {idx < BUTTON_COUNT - 1 && <div style={{ height: gap }} />}
          </React.Fragment>
        );
      })}
      {/* Bottom space */}
      <div style={{ flex: 1, height: bottomSpace }} />
    </nav>
  );
}
