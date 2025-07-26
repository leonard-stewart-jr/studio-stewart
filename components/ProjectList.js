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
          {/* Right: Clickable Banner Image as Card */}
          <div
            onClick={() => onProjectClick(idx)}
            style={{
              flex: 1,
              minWidth: 0,
              maxWidth: 700,
              aspectRatio: "16/9",
              background: "#eee",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              borderRadius: 8,
              position: "relative",
              boxShadow: "0 2px 12px rgba(32,32,32,0.12)",
              cursor: "pointer"
            }}
            tabIndex={0}
            aria-label={`Open interactive modal for ${project.title}`}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") onProjectClick(idx);
            }}
          >
            {project.bannerSrc && (
              <img
                src={project.bannerSrc}
                alt={project.title + " banner"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  filter: "none",
                  transition: "filter 0.18s"
                }}
              />
            )}
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
                letterSpacing: ".04em"
              }}
            >
              View Interactive Model
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
