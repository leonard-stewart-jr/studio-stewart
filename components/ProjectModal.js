import { useRef, useEffect } from "react";

export default function ProjectModal({ project, onClose }) {
  const scrollRef = useRef(null);

  // Allow closing with Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!project) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        zIndex: 2000,
        inset: 0,
        background: "rgba(255,255,255,0.97)",
        overflow: "hidden",
        width: "100vw",
        height: "100vh",
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={e => e.stopPropagation()} // Prevent closing when clicking content
      >
        {/* Horizontal scroll area */}
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            flexDirection: "row",
            height: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "thin",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* First block: Project description and metadata */}
          <div
            style={{
              minWidth: "32vw",
              maxWidth: "36vw",
              padding: "64px 42px",
              display: "flex",
              alignItems: "center",
              background: "#fff",
              color: "#222",
              fontSize: "19px",
              lineHeight: 1.6,
              scrollSnapAlign: "start",
              boxSizing: "border-box",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 26, marginBottom: 22, letterSpacing: 0.01, textTransform: "uppercase" }}>
                {project.title}
              </div>
              <div style={{ fontSize: 15, color: "#888", marginBottom: 16, textTransform: "uppercase", letterSpacing: ".1em" }}>
                {project.grade} — {project.type}
              </div>
              <div>{project.description}</div>
            </div>
          </div>
          {/* Media blocks */}
          {project.media.map((media, idx) => (
            <div
              key={idx}
              style={{
                minWidth: "60vw",
                maxWidth: "70vw",
                padding: "40px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                scrollSnapAlign: "start",
                boxSizing: "border-box",
              }}
            >
              {media.type === "video" ? (
                <video
                  src={media.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "70vh",
                    borderRadius: 10,
                    background: "#eee",
                  }}
                />
              ) : (
                <img
                  src={media.src}
                  alt={media.caption || project.title}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "70vh",
                    borderRadius: 10,
                    background: "#eee",
                  }}
                />
              )}
            </div>
          ))}
        </div>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 24,
            right: 48,
            fontSize: 36,
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
            zIndex: 10,
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.07))",
          }}
        >
          &times;
        </button>
      </div>
      {/* Hide scrollbars (optional) */}
      <style jsx global>{`
        div[role="dialog"]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
