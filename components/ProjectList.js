export default function ProjectList({ projects, onProjectClick }) {
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
      {projects.map((project, idx) => {
        const firstMedia = project.media[0];
        let videoElement = null;

        // Video hover handlers
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
              cursor: "pointer",
              width: "100%",
              userSelect: "none",
              gap: "56px",
            }}
            tabIndex={0}
            aria-label={`Open ${project.title} project`}
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
            {/* Right: Main image or video */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                maxWidth: 700,
                aspectRatio: "16/9",
                background: "#eee",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                borderRadius: 0,
                boxShadow: "none",
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
                    borderRadius: 0,
                    display: "block",
                  }}
                  muted
                  loop
                  preload="none"
                  playsInline
                />
              ) : (
                <img
                  src={firstMedia.src}
                  alt={`${project.title} cover`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 0,
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
