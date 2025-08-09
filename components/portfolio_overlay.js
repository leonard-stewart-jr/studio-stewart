import RibbonTab from "./ribbontab";

export default function PortfolioOverlay({ project, onReveal }) {
  // Frame size matches SVG and image
  const frameW = 700;
  const frameH = 412;

  return (
    <div
      style={{
        position: "relative",
        width: frameW,
        height: frameH,
        maxWidth: "100%",
        margin: "0 auto",
        userSelect: "none",
        zIndex: 1,
        overflow: "visible",
      }}
    >
      {/* Hero image below the frame */}
      <img
        src={project.bannerSrc}
        alt={project.title + " banner"}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          border: "none",
          display: "block",
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 0,
        }}
        draggable={false}
      />
      {/* Torn paper SVG overlay */}
      <img
        src="/images/portfolio/torn-paper-frame.svg"
        alt="Torn paper overlay"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 2,
        }}
        draggable={false}
      />
      {/* Interactive RibbonTab (right edge, vertical center) */}
      <RibbonTab
        label="More"
        onClick={onReveal}
        top="50%"
      />
    </div>
  );
}
