import { useEffect, useRef, useState } from "react";

export default function ProjectList({ projects, onProjectClick }) {
  const showCaptionOnce = useRef(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1200;
      setIsMobile(w < 700);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function overlayLabel(project) {
    if (project.action === "route") return "View Project";
    if (project.action === "modal" && project.modalType === "pdf") return "Open Portfolio";
    return "View Interactive Model";
  }

  const pageContainerStyle = {
    width: "min(1100px, 90vw)",
    margin: "0 auto",
    padding: "16px 0 48px 0",
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? 32 : 40,
    boxSizing: "border-box"
  };

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "minmax(260px, 320px) 1fr",
    alignItems: "center",
    gap: isMobile ? 12 : 16,
    width: "100%"
  };

  const infoColStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: isMobile ? "flex-start" : "flex-end",
    textAlign: isMobile ? "left" : "right",
    gap: 3, // tighter vertical spacing
    padding: isMobile ? "0 8px" : "0 6px 0 0"
  };

  // Row 1 — Title
  const titleStyle = {
    margin: 0,
    fontFamily: "coolvetica, sans-serif",
    fontWeight: 300,
    fontSize: isMobile ? 18 : 20,
    letterSpacing: ".02em",
    textTransform: "uppercase",
    lineHeight: 1.2,
    color: "inherit"
  };

  // Row 2 — Type
  const typeStyle = {
    margin: "2px 0 0 0",
    fontFamily: "coolvetica, sans-serif",
    fontWeight: 300,
    fontSize: isMobile ? 13 : 14,
    color: "#8a8a86",
    letterSpacing: ".035em",
    textTransform: "uppercase",
    lineHeight: 1.2
  };

  // Row 3 — Grade (semester + year)
  const gradeStyle = {
    margin: "2px 0 0 0",
    fontFamily: "coolvetica, sans-serif",
    fontWeight: 300,
    fontSize: isMobile ? 11 : 12,
    color: "#b0afa9",
    letterSpacing: ".06em",
    textTransform: "uppercase",
    lineHeight: 1.15
  };

  const descStyle = {
    margin: "6px 0 0 0",
    fontSize: isMobile ? 12 : 13,
    color: "#888",
    letterSpacing: ".01em"
  };

  const imageWrapStyle = {
    position: "relative",
    width: "100%",
    maxWidth: "900px",
    margin: isMobile ? "0 auto" : "0",
    cursor: "pointer",
    borderRadius: 6,
    overflow: "hidden",
    boxShadow: "0 3px 14px rgba(0,0,0,0.10)",
    border: "1px solid #e9e7e0",
    background: "#f6f5f2",
    transition: "box-shadow 0.18s, border-color 0.18s, transform 0.18s"
  };

  const imageStyle = {
    display: "block",
    width: "100%",
    height: "auto"
  };

  const overlayStyle = {
    position: "absolute",
    left: 14,
    bottom: 12,
    padding: "6px 10px",
    background: "rgba(0,0,0,0.35)",
    color: "#fff",
    fontFamily: "coolvetica, sans-serif",
    fontSize: 12,
    letterSpacing: ".06em",
    textTransform: "uppercase",
    borderRadius: 4,
    userSelect: "none"
  };

  return (
    <div style={pageContainerStyle}>
      {projects.map((project, idx) => (
        <div key={project.slug || idx} style={rowStyle}>
          {/* Info column */}
          <div style={infoColStyle}>
            <h2 style={titleStyle}>{project.title}</h2>
            <div style={typeStyle}>{project.type}</div>
            <div style={gradeStyle}>{project.grade}</div>
            {project.description && <p style={descStyle}>{project.description}</p>}
          </div>

          {/* Image column */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`Open ${project.title}`}
            onClick={() => onProjectClick(idx)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onProjectClick(idx);
              }
            }}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() =>
              setHoveredIndex((h) => (h === idx ? null : h))
            }
            style={{
              ...imageWrapStyle,
              transform:
                hoveredIndex === idx && !isMobile ? "translateY(-2px)" : "none",
              boxShadow:
                hoveredIndex === idx && !isMobile
                  ? "0 6px 18px rgba(0,0,0,0.12)"
                  : imageWrapStyle.boxShadow,
              border:
                hoveredIndex === idx && !isMobile
                  ? "1px solid #e6dbb9"
                  : imageWrapStyle.border
            }}
          >
            <img
              src={project.bannerSrc}
              alt={project.title}
              style={imageStyle}
            />
            <div style={overlayStyle}>{overlayLabel(project)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
