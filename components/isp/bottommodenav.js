import { motion } from "framer-motion";
import { getPinPalette } from "./modal/pin-utils";

// Mode definitions
const MODE_LABELS = {
  world: "WORLD",
  usa: "UNITED STATES",
  sd: "SOUTH DAKOTA",
};

const MODES = ["world", "usa", "sd"];
const STROKE_COLOR = "#181818";

// Util: Split label into array of letters, including spaces
function splitLabel(label) {
  return label.split(""); // includes spaces
}

export default function BottomModeNav({ active, onChange }) {
  // Theme colors for each mode, matching screenshot and legacy style:
  const modeColors = {
    world: "#b48b7e",           // dark terracotta for WORLD
    usa: "#b1b1ae",             // light gray for UNITED STATES
    sd: "#b1b1ae"               // light gray for SOUTH DAKOTA
  };
  const activeShadow = "2px 3px 0 #d6c08e, 0px 0px 8px #fff4e7";
  const inactiveShadow = "none";
  const activeWeight = 900;
  const inactiveWeight = 900; // screenshot uses bold for all

  const modes = [
    { value: "world", label: "WORLD" },
    { value: "usa", label: "UNITED STATES" },
    { value: "sd", label: "SOUTH DAKOTA" }
  ];

  return (
    <nav
      style={{
        width: "100vw",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 44,
        marginTop: 30,
        marginBottom: 10,
        fontFamily: "coolvetica, sans-serif",
        background: "none",
        boxShadow: "none",
        zIndex: 120,
        position: "relative",
        paddingLeft: 42,
        paddingRight: 42,
        minHeight: 64
      }}
      aria-label="Select dataset view"
    >
      {modes.map((mode, idx) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          tabIndex={0}
          aria-current={active === mode.value ? "page" : undefined}
          style={{
            background: "none",
            border: "none",
            fontFamily: "coolvetica, sans-serif",
            fontWeight: active === mode.value ? activeWeight : inactiveWeight,
            fontSize: 36,
            color: modeColors[mode.value],
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            lineHeight: 1.03,
            cursor: active === mode.value ? "default" : "pointer",
            textDecoration: "none",
            textShadow: active === mode.value ? activeShadow : inactiveShadow,
            opacity: active === mode.value ? 1 : 0.70,
            borderRadius: 2,
            outline: "none",
            margin: 0,
            padding: "4px 24px 3px 0",
            minWidth: 80,
            textAlign: "left",
            transition: "color 0.19s, text-shadow 0.19s, opacity 0.17s",
            filter: "none",
            pointerEvents: active === mode.value ? "none" : "auto",
            userSelect: "none"
          }}
          disabled={active === mode.value}
        >
          {mode.label}
        </button>
      ))}
    </nav>
  );
}
