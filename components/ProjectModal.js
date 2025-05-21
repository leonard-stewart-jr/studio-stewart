export default function ProjectModal({
  project,
  activeIndex,
  setActiveIndex,
  projectsLength,
  onClose,
  onTouchStart,
  onTouchEnd
}) {
  if (!project) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        zIndex: 2000,
        inset: 0,
        background: "rgba(255,255,255,0.97)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        transition: "background 0.2s",
        cursor: "zoom-out",
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
      aria-modal="true"
      role="dialog"
    >
      <div
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 8px 48px rgba(0,0,0,0.17)",
          overflow: "hidden",
          position: "relative",
          cursor: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Project media */}
        <div style={{ width: "min(80vw,900px)", maxHeight: "70vh", margin: "0 auto" }}>
          <img
            src={project.coverSrc}
            alt={`${project.title} cover`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: 8,
              background: "#eee",
            }}
          />
        </div>
        {/* Project info and navigation arrows */}
        <div
          style={{
            width: "min(80vw,900px)",
            padding: "24px 12px 16px 12px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <button
            aria-label="Previous project"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            style={{
              fontSize: 28,
              background: "none",
              border: "none",
              color: activeIndex === 0 ? "#bbb" : "#181818",
              cursor: activeIndex === 0 ? "default" : "pointer",
              padding: 8,
            }}
          >
            &#8592;
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 22, textTransform: "uppercase" }}>
              {project.title}
            </div>
            <div style={{ fontSize: 14, color: "#888", margin: "7px 0", textTransform: "uppercase", letterSpacing: ".1em" }}>
              {project.grade} — {project.type}
            </div>
            <div style={{ fontSize: 16, color: "#444", marginTop: 8 }}>
              {project.description}
            </div>
          </div>
          <button
            aria-label="Next project"
            disabled={activeIndex === projectsLength - 1}
            onClick={() => setActiveIndex((i) => Math.min(projectsLength - 1, i + 1))}
            style={{
              fontSize: 28,
              background: "none",
              border: "none",
              color: activeIndex === projectsLength - 1 ? "#bbb" : "#181818",
              cursor: activeIndex === projectsLength - 1 ? "default" : "pointer",
              padding: 8,
            }}
          >
            &#8594;
          </button>
        </div>
        <button
          aria-label="Close"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 20,
            fontSize: 32,
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
