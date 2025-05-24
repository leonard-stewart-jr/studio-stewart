import { useRef } from "react";

export default function ProjectList({ projects, onProjectClick }) {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        gap: "40px",
        justifyContent: "center",
        padding: "50px 0"
      }}
    >
      {projects.map((project, idx) => {
        const firstMedia = project.media[0];
        let videoElement = null;

        return (
          <div
            key={project.slug}
            onClick={() => onProjectClick(idx)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
              minWidth: 320,
              maxWidth: 340,
              width: "100%",
              userSelect: "none",
              padding: 20,
              transition: "box-shadow 0.2s",
            }}
            tabIndex={0}
            aria-label={`Open ${project.title} project`}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "16/9",
                background: "#eee",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                borderRadius: 8,
                marginBottom: 18,
                position: "relative",
              }}
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
                    borderRadius: 8,
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
                    borderRadius: 8,
                  }}
                />
              )}
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 20,
                marginBottom: 8,
                letterSpacing: 0.01,
                lineHeight: 1.2,
                textTransform: "uppercase",
                textAlign: "center"
              }}
            >
              {project.title}
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#888",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                marginBottom: 4,
                textAlign: "center"
              }}
            >
              {project.grade} — {project.type}
            </div>
          </div>
        );
      })}
    </section>
  );
}
