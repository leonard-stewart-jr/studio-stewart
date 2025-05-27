import ImageSlider from "./ImageSlider";

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
          {/* Right: Image Slider */}
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
          >
            <ImageSlider
              images={[
                { src: "/images/6am-summer.jpg", label: "6AM, Summer Solstice" },
                { src: "/images/noon-summer.jpg", label: "Noon, Summer Solstice" },
                { src: "/images/6pm-summer.jpg", label: "6PM, Summer Solstice" },
                { src: "/images/midnight-summer.jpg", label: "Midnight, Summer Solstice" },
                { src: "/images/6am-winter.jpg", label: "6AM, Winter Solstice" },
                { src: "/images/noon-winter.jpg", label: "Noon, Winter Solstice" },
                { src: "/images/6pm-winter.jpg", label: "6PM, Winter Solstice" },
                { src: "/images/midnight-winter.jpg", label: "Midnight, Winter Solstice" },
                { src: "/images/6am-equinox.jpg", label: "6AM, Spring/Fall Equinox" },
                { src: "/images/noon-equinox.jpg", label: "Noon, Spring/Fall Equinox" },
                { src: "/images/6pm-equinox.jpg", label: "6PM, Spring/Fall Equinox" },
                { src: "/images/midnight-equinox.jpg", label: "Midnight, Spring/Fall Equinox" },
              ]}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
