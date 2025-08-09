import { useState, useRef } from "react";
import PropTypes from "prop-types";

export default function PortfolioOverlay({
  project,
  onReveal,
  showCaptionOnce,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [isTearing, setIsTearing] = useState(false);
  const tabRef = useRef(null);

  // Caption logic (show once per session)
  function handleTabHover() {
    if (!showCaptionOnce.current) {
      setShowCaption(true);
      showCaptionOnce.current = true;
      setTimeout(() => setShowCaption(false), 1600);
    }
    setIsHovered(true);
  }

  // Drag logic
  function handleDragStart(e) {
    if (isTearing) return;
    setIsTearing(true);
    setTimeout(() => {
      setIsTearing(false);
      onReveal();
    }, 750); // Simulate tear duration
  }
  function handleDoubleClick() {
    if (isTearing) return;
    setIsTearing(true);
    setTimeout(() => {
      setIsTearing(false);
      onReveal();
    }, 750);
  }

  // SVG torn overlay path (static for now, can be animated in future)
  // Right edge jagged path with drop shadow filter
  const tornSvg = (
    <svg
      viewBox="0 0 700 400"
      width="100%"
      height="100%"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 3,
        mixBlendMode: "multiply",
      }}
    >
      <defs>
        <filter id="paperShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="-8" dy="0" stdDeviation="6" floodColor="#222" floodOpacity="0.22"/>
        </filter>
      </defs>
      <path
        d="
          M0,0
          L690,0
          Q695,40 699,70
          Q695,110 699,140
          Q695,180 699,220
          Q695,270 699,320
          Q695,370 690,400
          L0,400
          Z
        "
        fill="rgba(232,228,198,0.93)"
        stroke="#e6dbb9"
        strokeWidth="1.5"
        filter="url(#paperShadow)"
      />
    </svg>
  );

  // Scroll tab curl
  const scrollTab = (
    <div
      ref={tabRef}
      tabIndex={0}
      aria-label="Open project; drag right or double-click"
      style={{
        position: "absolute",
        right: -38,
        top: "50%",
        transform: "translateY(-50%)",
        width: 64,
        height: 74,
        background: "linear-gradient(120deg, #e6dbb9 80%, #d6c08e 100%)",
        borderRadius: "0 38px 38px 0",
        boxShadow: isHovered
          ? "0 2px 22px rgba(32,32,32,0.22)"
          : "0 2px 12px rgba(32,32,32,0.13)",
        cursor: "pointer",
        zIndex: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "box-shadow 0.18s, transform 0.18s",
        outline: "none",
        rotate: isHovered ? "5deg" : "0deg",
        borderLeft: "3px solid #e6dbb9",
      }}
      onMouseEnter={handleTabHover}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleDragStart}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleDragStart}
      onFocus={handleTabHover}
      onBlur={() => setIsHovered(false)}
    >
      <span style={{
        fontWeight: 700,
        color: "#b1b1ae",
        fontSize: 17,
        letterSpacing: ".08em",
        pointerEvents: "none"
      }}>
        &#8677;
      </span>
      {showCaption && (
        <span style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translate(-50%, 6px)",
          background: "#222",
          color: "#e6dbb9",
          padding: "6px 18px",
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 500,
          boxShadow: "0 3px 12px rgba(32,32,32,0.17)",
          zIndex: 12,
          whiteSpace: "nowrap"
        }}>
          Drag right or double-click to open
        </span>
      )}
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        maxWidth: 700,
        minHeight: 220,
        overflow: "hidden",
        borderRadius: 8,
        boxShadow: "0 2px 12px rgba(32,32,32,0.12)",
        cursor: isTearing ? "progress" : "pointer",
        background: "#eee",
      }}
      tabIndex={0}
      aria-label={`Reveal project ${project.title}`}
      onKeyDown={e => {
        if ((e.key === "Enter" || e.key === " ") && !isTearing) handleDragStart(e);
      }}
    >
      {/* Underlay: Hero image */}
      {project.bannerSrc && (
        <img
          src={project.bannerSrc}
          alt={project.title + " banner"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            filter: isTearing ? "brightness(0.77)" : "none",
            transition: "filter 0.18s"
          }}
        />
      )}

      {/* Paper torn overlay */}
      {tornSvg}

      {/* Scroll tab curl */}
      {scrollTab}

      {/* "View Interactive Model" overlay */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "10px 0",
          background: "rgba(32,32,32,0.64)",
          color: "#e6dbb9",
          fontWeight: 600,
          fontSize: 18,
          textAlign: "center",
          letterSpacing: ".04em",
          zIndex: 7
        }}
      >
        View Interactive Model
      </div>

      {/* Tear animation overlay (simulated for now) */}
      {isTearing && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 44,
            height: "100%",
            background: "linear-gradient(to left, #fff 65%, transparent 100%)",
            zIndex: 10,
            opacity: 0.88,
            pointerEvents: "none",
            animation: "tearAnim 0.7s cubic-bezier(.5,1.2,.7,1) forwards"
          }}
        />
      )}
      <style>{`
        @keyframes tearAnim {
          from { height: 0%; opacity: 1; }
          to { height: 100%; opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}

PortfolioOverlay.propTypes = {
  project: PropTypes.object.isRequired,
  onReveal: PropTypes.func.isRequired,
  showCaptionOnce: PropTypes.object.isRequired,
};
