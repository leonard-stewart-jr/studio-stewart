import { useRef } from "react";

export default function ProjectList({ projects, onProjectClick }) {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: 1100,
        display: "flex",
        flexDirection: "column",
        gap: "68px",
      }}
    >
      {projects.map((project, idx) => {
        const firstMedia = project.media[0];
        // Use a callback ref to avoid useRef-in-map bug
        let videoElement = null;

        // Handler functions for play/pause on hover
        const handleMouseEnter = () => {
          if (firstMedia.type === "video" && videoElement) {
            videoElement.play();
          }
        };
        const handleMouseLeave = () => {
          if (firstMedia.type === "video" && videoElement) {
            videoElement.pause();
            videoElement.currentTime = 0;
          }
        };

        return (
          <div
            key={project.slug}
            onClick={() => onProjectClick(idx)}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "36px",
              cursor: "pointer",
              width: "100%",
              userSelect: "none",
            }}
            tabIndex={0}
            aria-label={`Open ${project.title} project`}
          >
            {/* Left column: Project info */}
            <div
              style={{
                minWidth: 210,
                maxWidth: 210,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                flexShrink: 0,
                marginRight: 24,
                gap: 8,
              }}
            >
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 19,
                    marginBottom: 2,
                    letterSpacing: 0.01,
                    lineHeight: 1.2,
                    textTransform: "uppercase",
                  }}
                >
                  {project.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#888",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}
                >
                  {project.grade} — {project.type}
                </div>
              </div>
            </div>
            {/* Right column: Project cover (video or image) */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                width: "100%",
                maxWidth: 600,
                aspectRatio: "16/9",
                background: "#eee",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                borderRadius: 6,
                boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                position: "relative",
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {firstMedia.type === "video" ? (
                <video
                  ref={el => (videoElement = el)}
                  src={firstMedia.src}
                  poster={project.media.find(m => m.type === "image")?.src}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 6,
                    display: "block",
                  }}
                  muted
                  loop
                  preload="none"
                  playsInline
                  // Do NOT autoplay by default
                />
              ) : (
                <img
                  src={firstMedia.src}
                  alt={`${project.title} cover`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
