import { useRef, useState } from "react";

export default function ProjectList({ projects, onProjectClick }) {
  // Previously used for "show once"; keeping ref in case we reintroduce logic later
  const showCaptionOnce = useRef(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "0 24px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {projects.map((project, idx) => (
        <div
          key={project.slug || idx}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr minmax(300px, 900px)",
            gap: "24px",
            alignItems: "center",
            margin: "32px 0",
          }}
        >
          {/* Left: Info */}
          <div>
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "28px",
                lineHeight: 1.15,
                fontWeight: 900,
                letterSpacing: "0.2px",
              }}
            >
              {project.title}
            </h2>
            <div
              style={{
                margin: 0,
                color: "#6f6f6a",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {project.grade} — {project.type}
            </div>
          </div>

          {/* Right: Flat image with hover caption (replaces torn-paper PortfolioOverlay) */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`Open interactive modal for ${project.title}`}
            onClick={() => onProjectClick(idx)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onProjectClick(idx);
              }
            }}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex((h) => (h === idx ? null : h))}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "900px",
              cursor: "pointer",
              borderRadius: 0, // flat: no rounding
              overflow: "hidden",
              boxShadow: "none", // flat: no shadow
              border: "none", // flat: no border
              background: "#f5f5f2",
            }}
          >
            <img
              src={project.bannerSrc}
              alt={project.title}
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                verticalAlign: "middle",
              }}
            />

            {/* Hover overlay + caption */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                background:
                  hoveredIndex === idx ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.0)",
                transition: "background 0.18s ease",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  opacity: hoveredIndex === idx ? 1 : 0,
                  transition: "opacity 0.18s ease",
                  color: "#fff",
                  background: "rgba(0,0,0,0.55)",
                  padding: "8px 12px",
                  margin: "16px",
                  borderRadius: 4,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontSize: 14,
                }}
              >
                View Interactive Model
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
