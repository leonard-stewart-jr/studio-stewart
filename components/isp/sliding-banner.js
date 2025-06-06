import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Banner definitions
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

  const handleBannerClick = (key) => {
    setOpenBanner(prev => (prev === key ? null : key));
  };

  const leftOpen = openBanner === "origins";
  const rightOpen = openBanner === "breaking";
  const sheetWidth = `calc(100vw - ${BANNER_WIDTH}px)`;

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
          color={BANNERS[0].color}
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
          color={BANNERS[1].color}
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
              top: 0,
              left: 0,
              height: "100vh",
              width: sheetWidth,
              zIndex: 200,
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              boxShadow: "2px 0 16px rgba(0,0,0,0.13)",
              overflow: "auto",
            }}
          >
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              overflow: "auto",
              padding: 0,
            }}>
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
                    color: "#b32c2c",
                    fontWeight: 700,
                    fontSize: 38,
                    cursor: "pointer",
                  }}
                  aria-label="Close sheet"
                >
                  &times;
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
              top: 0,
              right: 0,
              height: "100vh",
              width: sheetWidth,
              zIndex: 200,
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-2px 0 16px rgba(0,0,0,0.13)",
              overflow: "auto",
            }}
          >
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              overflow: "auto",
              padding: 0,
            }}>
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
                    color: "#35396e",
                    fontWeight: 700,
                    fontSize: 38,
                    cursor: "pointer",
                  }}
                  aria-label="Close sheet"
                >
                  &times;
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
        top: 0,
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
