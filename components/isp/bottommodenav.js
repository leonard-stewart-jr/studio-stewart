import { motion, AnimatePresence } from "framer-motion";

// Theme fill colors for each mode (from your pin file or palette)
const MODE_THEMES = {
  world: { fill: "#b38c4d", label: "WORLD" },               // earthtone
  usa: { fill: "#b32c2c", label: "UNITED STATES" },         // usa red
  sd: { fill: "#3e6c4b", label: "SOUTH DAKOTA" },           // sd green
};

// Stroke color (always #181818)
const STROKE_COLOR = "#181818";

export default function BottomModeNav({ active, onChange }) {
  // Layout: left, center, right
  const modes = ["world", "usa", "sd"];
  return (
    <nav
      aria-label="Mode selector"
      style={{
        position: "fixed",
        left: 0,
        bottom: 35,
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
      {modes.map((mode, idx) => {
        // Spread the buttons: left, center, right
        let justify = "flex-start";
        if (mode === "usa") justify = "center";
        if (mode === "sd") justify = "flex-end";
        const isActive = active === mode;
        // Label
        const theme = MODE_THEMES[mode];

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
              aria-label={theme.label}
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
                color: theme.fill,
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: ".07em",
                textTransform: "uppercase",
                lineHeight: 1.15,
                textShadow: `-1px -1px 0 ${STROKE_COLOR}, 1px -1px 0 ${STROKE_COLOR}, -1px 1px 0 ${STROKE_COLOR}, 1px 1px 0 ${STROKE_COLOR}`,
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
                fontSize: isActive ? 36 : 24,
              }}
            >
              {theme.label}
            </motion.button>
          </div>
        );
      })}
    </nav>
  );
}
