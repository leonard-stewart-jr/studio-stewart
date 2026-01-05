import { useRef, useState } from "react";

export default function ProjectList({ projects, onProjectClick }) {
  const showCaptionOnce = useRef(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  function overlayLabel(project) {
    if (project.action === "route") return "View Project";
    if (project.action === "modal" && project.modalType === "pdf") return "Open Portfolio";
    return "View Interactive Model";
    }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 42, padding: "24px 24px 48px 24px" }}>
      {projects.map((project, idx) => (
        <div
          key={project.slug || idx}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            alignItems: "center",
          }}
        >
          {/* Left: Info */}
          <div>
            <h2 style={{ margin: "0 0 8px 0", fontSize: 28, lineHeight: 1.15 }}>
              {project.title}
            </h2>
            <div style={{ color: "#7d7d78", fontSize: 14, marginBottom: 10 }}>
              {project.grade} — {project.type}
            </div>
            {project.description && (
              <div style={{ color: "#4a4a46", fontSize: 15 }}>{project.description}</div>
            )}
          </div>

          {/* Right: Image with overlay */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`Open ${overlayLabel(project)} for ${project.title}`}
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
              maxWidth: 900,
              cursor: "pointer",
              borderRadius: 0,
              overflow: "hidden",
              boxShadow: "none",
              border: "none",
              background: "#f5f5f2",
            }}
          >
            <img
              src={project.bannerSrc}
              alt={project.title}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            {/* Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-start",
                padding: 16,
                background:
                  hoveredIndex === idx
                    ? "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.42) 100%)"
                    : "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.28) 100%)",
                color: "#fff",
                transition: "background 0.18s",
              }}
            >
              <span style={{ fontSize: 14, letterSpacing: 0.4, textTransform: "uppercase" }}>
                {overlayLabel(project)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
