import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Header and subnav heights to keep sliding sheets below both
const HEADER_HEIGHT = 76; // px
const SUBNAV_BANNER_HEIGHT = 38; // px
const SHEET_TOP = HEADER_HEIGHT + SUBNAV_BANNER_HEIGHT; // 114

const BANNERS = [
  {
    key: "origins",
    side: "left",
    color: "#b32c2c",
    label: "ORIGINS OF CONFINEMENT",
    img: "/images/isp/origins-ds.png",
  },
  {
    key: "breaking",
    side: "right",
    color: "#35396e",
    label: "BREAKING THE CYCLE",
    img: "/images/isp/breaking-ds.png",
  },
];

const BANNER_WIDTH = 80; // px

export default function SlidingBanner({ children }) {
  const [openBanner, setOpenBanner] = useState(null);

  // Body scrollbar control: only allow vertical scroll when sheet is open
  useEffect(() => {
    if (openBanner) {
      document.body.classList.add("show-scrollbar");
    } else {
      document.body.classList.remove("show-scrollbar");
    }
    return () => document.body.classList.remove("show-scrollbar");
  }, [openBanner]);

  const handleBannerClick = (key) => {
    setOpenBanner(prev => (prev === key ? null : key));
  };

  const leftOpen = openBanner === "origins";
  const rightOpen = openBanner === "breaking";
  const sheetWidth = `calc(100vw - ${BANNER_WIDTH}px)`;

  // Opposite sidebar color for scrollbar
  const leftColor = BANNERS[0].color;
  const rightColor = BANNERS[1].color;
  const rightBannerColor = leftOpen ? leftColor : rightColor;
  const leftBannerColor = rightOpen ? rightColor : leftColor;

  // Custom scrollbar color for sheet
  const sheetScrollbarThumb =
    openBanner === "origins"
      ? leftColor
      : openBanner === "breaking"
      ? rightColor
      : "#e6dbb9";

  return (
    <div style={{
      display: "flex",
      width: "100vw",
      minHeight: "100vh",
      position: "relative",
      background: "#fafafa",
      overflow: "hidden"
    }}>
      {/* Left Banner */}
      <div
        style={{
          zIndex: 110,
          position: "relative",
          width: BANNER_WIDTH,
          minWidth: BANNER_WIDTH,
          cursor: "pointer",
          flexShrink: 0,
        }}
        onClick={() => handleBannerClick("origins")}
        tabIndex={0}
        aria-label="Open Origins of Confinement"
      >
        <BannerVisual
          color={leftBannerColor}
          text={BANNERS[0].label}
          side="left"
          active={leftOpen}
          faded={!!openBanner && !leftOpen}
        />
      </div>

      {/* Main Content (hidden if sheet open) */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          pointerEvents: openBanner ? "none" : "auto",
          opacity: openBanner ? 0 : 1,
          transition: "opacity 0.28s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
        }}
        aria-hidden={!!openBanner}
      >
        {children}
      </div>

      {/* Right Banner */}
      <div
        style={{
          zIndex: 110,
          position: "relative",
          width: BANNER_WIDTH,
          minWidth: BANNER_WIDTH,
          cursor: "pointer",
          flexShrink: 0,
        }}
        onClick={() => handleBannerClick("breaking")}
        tabIndex={0}
        aria-label="Open Breaking the Cycle"
      >
        <BannerVisual
          color={rightBannerColor}
          text={BANNERS[1].label}
          side="right"
          active={rightOpen}
          faded={!!openBanner && !rightOpen}
        />
      </div>

      {/* Sliding Sheet overlays */}
      <AnimatePresence>
        {leftOpen && (
          <motion.div
            key="left-sheet"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.55, ease: [0.83, 0, 0.17, 1] }}
            style={{
              position: "fixed",
              top: SHEET_TOP,
              left: 0,
              height: `calc(100vh - ${SHEET_TOP}px)`,
              width: sheetWidth,
              zIndex: 200,
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              boxShadow: "2px 0 16px rgba(0,0,0,0.13)",
              overflow: "auto",
              // Custom scrollbar for the sliding sheet
              scrollbarColor: `${sheetScrollbarThumb} #f0f0ed`,
              scrollbarWidth: "thin",
            }}
          >
            <style>{`
              .sliding-sheet[data-color="red"]::-webkit-scrollbar-thumb {
                background: #b32c2c;
              }
              .sliding-sheet[data-color="blue"]::-webkit-scrollbar-thumb {
                background: #35396e;
              }
              .sliding-sheet::-webkit-scrollbar {
                width: 10px;
                background: #f0f0ed;
              }
              .sliding-sheet::-webkit-scrollbar-thumb {
                border-radius: 6px;
              }
            `}</style>
            <div
              className="sliding-sheet"
              data-color="red"
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                overflow: "auto",
                padding: 0,
              }}
            >
              <div style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
                padding: "12px 20px 0 0",
              }}>
                <button
                  onClick={() => handleBannerClick("origins")}
                  style={{
                    background: "none",
                    border: "none",
                    color: leftColor,
                    fontWeight: 700,
                    fontSize: 48,
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                  aria-label="Close sheet"
                >
                  &minus;
                </button>
              </div>
              <div style={{
                flex: 1,
                width: "100%",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingTop: 0,
                overflow: "auto",
              }}>
                {/* SHEET CONTENT */}
                <img
                  src={BANNERS[0].img}
                  alt={BANNERS[0].label}
                  style={{
                    width: "99%",
                    maxWidth: "none",
                    minWidth: 0,
                    margin: "0",
                    display: "block",
                    boxShadow: "0 8px 40px #2222",
                    borderRadius: 8,
                    background: "#fff",
                    objectFit: "contain",
                  }}
                  draggable={false}
                />
                {/* Placeholder for more content */}
                <div style={{ minHeight: 120, marginBottom: 32 }} />
              </div>
            </div>
          </motion.div>
        )}
        {rightOpen && (
          <motion.div
            key="right-sheet"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: [0.83, 0, 0.17, 1] }}
            style={{
              position: "fixed",
              top: SHEET_TOP,
              right: 0,
              height: `calc(100vh - ${SHEET_TOP}px)`,
              width: sheetWidth,
              zIndex: 200,
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-2px 0 16px rgba(0,0,0,0.13)",
              overflow: "auto",
              // Custom scrollbar for the sliding sheet
              scrollbarColor: `${sheetScrollbarThumb} #f0f0ed`,
              scrollbarWidth: "thin",
            }}
          >
            <style>{`
              .sliding-sheet[data-color="red"]::-webkit-scrollbar-thumb {
                background: #b32c2c;
              }
              .sliding-sheet[data-color="blue"]::-webkit-scrollbar-thumb {
                background: #35396e;
              }
              .sliding-sheet::-webkit-scrollbar {
                width: 10px;
                background: #f0f0ed;
              }
              .sliding-sheet::-webkit-scrollbar-thumb {
                border-radius: 6px;
              }
            `}</style>
            <div
              className="sliding-sheet"
              data-color="blue"
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                overflow: "auto",
                padding: 0,
              }}
            >
              <div style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                padding: "12px 0 0 20px",
              }}>
                <button
                  onClick={() => handleBannerClick("breaking")}
                  style={{
                    background: "none",
                    border: "none",
                    color: rightColor,
                    fontWeight: 700,
                    fontSize: 48,
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                  aria-label="Close sheet"
                >
                  &minus;
                </button>
              </div>
              <div style={{
                flex: 1,
                width: "100%",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingTop: 0,
                overflow: "auto",
              }}>
                {/* SHEET CONTENT */}
                <img
                  src={BANNERS[1].img}
                  alt={BANNERS[1].label}
                  style={{
                    width: "99%",
                    maxWidth: "none",
                    minWidth: 0,
                    margin: "0",
                    display: "block",
                    boxShadow: "0 8px 40px #2222",
                    borderRadius: 8,
                    background: "#fff",
                    objectFit: "contain",
                  }}
                  draggable={false}
                />
                {/* Placeholder for more content */}
                <div style={{ minHeight: 120, marginBottom: 32 }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Banner visual: vertical text and color
function BannerVisual({ color, text, side, active, faded }) {
  return (
    <div
      style={{
        width: 80,
        minWidth: 60,
        background: color,
        color: "#fff",
        writingMode: "vertical-rl",
        textOrientation: "mixed",
        fontWeight: "bold",
        fontSize: "2rem",
        letterSpacing: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        position: "sticky",
        top: 76,
        height: "100vh",
        left: side === "left" ? 0 : "unset",
        right: side === "right" ? 0 : "unset",
        boxShadow: active ? (side === "left" ? "2px 0 24px rgba(0,0,0,0.18)" : "-2px 0 24px rgba(0,0,0,0.18)") : undefined,
        cursor: "pointer",
        opacity: faded ? 0.4 : 1,
        transition: "box-shadow 0.18s, opacity 0.2s",
      }}
    >
      <span>{text}</span>
    </div>
  );
}
