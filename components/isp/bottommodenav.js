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
  return (
    <nav
      aria-label="Mode selector"
      style={{
        position: "fixed",
        left: 0,
        bottom: 35, // Shift up 35px from bottom
        width: "100vw",
        height: 76,
        zIndex: 4000,
        display: "flex",
        alignItems: "flex-end",
        pointerEvents: "none",
        background: "none",
        userSelect: "none",
      }}
    >
      {MODES.map((mode) => {
        // Button alignment
        let justify = "flex-start";
        if (mode === "usa") justify = "center";
        if (mode === "sd") justify = "flex-end";
        const isActive = active === mode;
        const label = MODE_LABELS[mode];
        const palette = getNavPalette(mode); // Array of colors

        return (
          <div
            key={mode}
            style={{
              flex: 1,
              display: "flex",
              justifyContent: justify,
              alignItems: "flex-end",
              pointerEvents: "auto",
              paddingLeft: mode === "world" ? 100 : 0,
              paddingRight: mode === "sd" ? 100 : 0,
              minWidth: 0,
              minHeight: 0,
              height: "100%",
            }}
          >
            <motion.button
              type="button"
              aria-pressed={isActive}
              aria-label={label}
              onClick={() => !isActive && onChange(mode)}
              disabled={isActive}
              whileTap={{ scale: 1.15 }}
              animate={{
                opacity: isActive ? 1 : 0.4,
                scale: isActive ? 1.5 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 32,
              }}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                fontFamily: "coolvetica, sans-serif",
                color: palette[0], // fallback for accessibility
                fontWeight: 700,
                fontSize: isActive ? 36 : 24, // <-- FIXED FONT SIZE HERE
                letterSpacing: ".07em",
                textTransform: "uppercase",
                lineHeight: 1.15,
                WebkitTextStroke: `1.5px ${STROKE_COLOR}`,
                cursor: isActive ? "default" : "pointer",
                opacity: isActive ? 1 : 0.4,
                transition: "opacity 0.17s, color 0.17s, font-size 0.17s, transform 0.21s",
                padding: "0 2vw 10px 2vw",
                minWidth: 0,
                minHeight: 0,
                borderRadius: 0,
                pointerEvents: "auto",
                boxShadow: "none",
                userSelect: "none",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "flex-end",
                gap: 0,
              }}
            >
              {splitLabel(label).map((char, i) => (
                <span
                  key={i}
                  style={{
                    color: char === " " ? "transparent" : palette[i % palette.length],
                    WebkitTextStroke: char === " " ? "none" : `1.5px ${STROKE_COLOR}`,
                    textShadow:
                      char === " "
                        ? "none"
                        : `-1px -1px 0 ${STROKE_COLOR}, 1px -1px 0 ${STROKE_COLOR}, -1px 1px 0 ${STROKE_COLOR}, 1px 1px 0 ${STROKE_COLOR}`,
                    fontFamily: "coolvetica, sans-serif",
                    fontWeight: 700,
                    fontSize: "inherit",
                    letterSpacing: ".07em",
                    lineHeight: 1.15,
                    textTransform: "uppercase",
                    display: "inline-block",
                    userSelect: "none",
                    marginRight: 0,
                  }}
                  aria-hidden={char === " "}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </motion.button>
          </div>
        );
      })}
    </nav>
  );
}
