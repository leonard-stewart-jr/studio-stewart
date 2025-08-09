import { useRef } from "react";
import PortfolioOverlay from "./portfolio_overlay";

export default function ProjectList({ projects, onProjectClick }) {
  // For caption logic: only show once per session (across cards)
  const showCaptionOnce = useRef(false);

  return (
    <section
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "64px auto 0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "90px",
      }}
    >
      {projects.map((project, idx) => (
        <div
          key={project.slug}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            userSelect: "none",
            gap: "56px",
          }}
        >
          {/* Left: Info */}
          <div
            style={{
              minWidth: 220,
              maxWidth: 240,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 18,
              flexShrink: 0,
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontWeight: 400,
                  fontSize: 16,
                  marginBottom: 2,
                  letterSpacing: 0.01,
                  color: "#222",
                }}
              >
                {project.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#7c7c7c",
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                }}
              >
                {project.grade} — {project.type}
              </div>
            </div>
          </div>
          {/* Right: PortfolioOverlay with torn overlay logic */}
          <div style={{ flex: 1, minWidth: 0, maxWidth: 700 }}>
            <PortfolioOverlay
              project={project}
              showCaptionOnce={showCaptionOnce}
              onReveal={() => onProjectClick(idx)}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
