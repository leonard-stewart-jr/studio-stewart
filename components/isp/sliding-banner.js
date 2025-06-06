import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function SlidingBanner({ children }) {
  const [openBanner, setOpenBanner] = useState(null);

  // Banner click handler
  const handleBannerClick = (key) => {
    setOpenBanner(prev =>
      prev === key ? null : key // Toggle off if already open, else open this
    );
  };

  // For z-index and transition direction
  const leftOpen = openBanner === "origins";
  const rightOpen = openBanner === "breaking";

  return (
    <div style={{ display: "flex", width: "100vw", minHeight: "100vh", position: "relative", background: "#fafafa" }}>
      {/* Left Banner */}
      <div
        style={{
          zIndex: leftOpen ? 102 : 100,
          position: "relative",
          width: 80,
          minWidth: 60,
          cursor: "pointer",
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
        />
      </div>

      {/* Main Content (hidden if banner open) */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          pointerEvents: openBanner ? "none" : "auto",
          opacity: openBanner ? 0 : 1,
          transition: "opacity 0.35s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
        }}
        aria-hidden={!!openBanner}
      >
        {children}
      </div>

      {/* Right Banner */}
      <div
        style={{
          zIndex: rightOpen ? 102 : 100,
          position: "relative",
          width: 80,
          minWidth: 60,
          cursor: "pointer",
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
        />
      </div>

      {/* Sliding overlays */}
      <AnimatePresence>
        {leftOpen && (
          <motion.div
            key="left-overlay"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.55, ease: [0.83, 0, 0.17, 1] }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              height: "100vh",
              width: "calc(100vw - 80px)", // stop at right banner
              zIndex: 200,
              background: BANNERS[0].color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "2px 0 16px rgba(0,0,0,0.13)",
            }}
            onClick={() => handleBannerClick("origins")}
            tabIndex={0}
            aria-label="Close Origins of Confinement"
          >
            <img
              src={BANNERS[0].img}
              alt="Origins of Confinement"
              style={{
                maxHeight: "90vh",
                maxWidth: "90vw",
                boxShadow: "0 8px 40px #2228",
                borderRadius: 14,
                background: "#fff",
                objectFit: "contain",
              }}
              draggable={false}
            />
          </motion.div>
        )}
        {rightOpen && (
          <motion.div
            key="right-overlay"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: [0.83, 0, 0.17, 1] }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100vh",
              width: "calc(100vw - 80px)", // stop at left banner
              zIndex: 200,
              background: BANNERS[1].color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "-2px 0 16px rgba(0,0,0,0.13)",
            }}
            onClick={() => handleBannerClick("breaking")}
            tabIndex={0}
            aria-label="Close Breaking the Cycle"
          >
            <img
              src={BANNERS[1].img}
              alt="Breaking the Cycle"
              style={{
                maxHeight: "90vh",
                maxWidth: "90vw",
                boxShadow: "0 8px 40px #2228",
                borderRadius: 14,
                background: "#fff",
                objectFit: "contain",
              }}
              draggable={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Banner visual: keeps vertical text and color
function BannerVisual({ color, text, side, active }) {
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
        transition: "box-shadow 0.18s",
        opacity: active ? 1 : 0.97,
      }}
    >
      <span>{text}</span>
    </div>
  );
}
