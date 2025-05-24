import { useRef, useEffect, useState, useCallback } from "react";

export default function ProjectModal({ project, onClose }) {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [panelRects, setPanelRects] = useState([]);

  // Scroll to a specific panel by index
  const scrollToIndex = useCallback(
    (idx) => {
      if (!scrollRef.current) return;
      const children = Array.from(scrollRef.current.children);
      if (!children[idx]) return;
      children[idx].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      setCurrentIndex(idx);
    },
    []
  );

  // Track which panel is in view and get bounding rects for click logic
  const updateRectsAndIndex = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const children = Array.from(el.children);
    // Find which panel is mostly in view
    let foundIdx = 0;
    if (children.length > 1) {
      const elRect = el.getBoundingClientRect();
      let minDist = Infinity;
      for (let i = 0; i < children.length; i++) {
        const rect = children[i].getBoundingClientRect();
        // Distance to left edge of scroll area
        const dist = Math.abs(rect.left - elRect.left);
        if (dist < minDist) {
          minDist = dist;
          foundIdx = i;
        }
      }
    }
    setCurrentIndex(foundIdx);

    // Save panel rects for click logic
    setPanelRects(children.map(child => child.getBoundingClientRect()));
  }, []);

  useEffect(() => {
    updateRectsAndIndex();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateRectsAndIndex, { passive: true });
    window.addEventListener("resize", updateRectsAndIndex);
    return () => {
      el.removeEventListener("scroll", updateRectsAndIndex);
      window.removeEventListener("resize", updateRectsAndIndex);
    };
  }, [updateRectsAndIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (!project) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        if (currentIndex > 0) {
          scrollToIndex(currentIndex - 1);
        }
      } else if (e.key === "ArrowRight") {
        if (currentIndex < project.media.length) {
          scrollToIndex(currentIndex + 1);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, project, currentIndex, scrollToIndex]);

  // When modal opens, reset to first panel
  useEffect(() => {
    setCurrentIndex(0);
    setTimeout(() => scrollToIndex(0), 0);
  }, [project, scrollToIndex]);

  if (!project) return null;

  // Click handler for the modal overlay
  const handleOverlayClick = (e) => {
    if (!scrollRef.current) return;
    // Get bounds of the current panel (media/text)
    const panelRect = panelRects[currentIndex];
    if (!panelRect) {
      onClose();
      return;
    }
    const clickX = e.clientX;
    const clickY = e.clientY;
    // If click is within the vertical bounds of the media/text panel
    if (clickY >= panelRect.top && clickY <= panelRect.bottom) {
      // Left or right half of viewport
      const vw = window.innerWidth;
      if (clickX < vw / 2) {
        // Left half: go left if possible
        if (currentIndex > 0) scrollToIndex(currentIndex - 1);
      } else {
        // Right half: go right if possible
        if (currentIndex < project.media.length) scrollToIndex(currentIndex + 1);
      }
    } else {
      // Outside media/text: close modal
      onClose();
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        zIndex: 2000,
        inset: 0,
        background: "rgba(255,255,255,0.97)",
        overflow: "hidden",
        width: "100vw",
        height: "100vh",
        cursor: "pointer"
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
      >
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
            scrollbarColor: "#e6dbb9 #f0f0ed",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            position: "relative",
          }}
          className="project-modal-scroll"
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
              justifyContent: "center",
            }}
          >
            <div>
              <div style={{
                fontWeight: 700,
                fontSize: 26,
                marginBottom: 22,
                letterSpacing: 0.01,
                textTransform: "uppercase"
              }}>
                {project.title}
              </div>
              <div style={{
                fontSize: 15,
                color: "#888",
                marginBottom: 16,
                textTransform: "uppercase",
                letterSpacing: ".1em"
              }}>
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
                justifyContent: "center"
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
                    pointerEvents: "none",
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
                    pointerEvents: "none",
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
          aria-label="Close"
        >
          &times;
        </button>
      </div>
      {/* Custom scrollbar styles for modal scroll area */}
      <style jsx global>{`
        .project-modal-scroll::-webkit-scrollbar {
          height: 8px;
          background: #f0f0ed;
        }
        .project-modal-scroll::-webkit-scrollbar-thumb {
          background: #e6dbb9;
          border-radius: 6px;
        }
        .project-modal-scroll::-webkit-scrollbar-thumb:hover {
          background: #d6c08e;
        }
        .project-modal-scroll {
          scrollbar-width: thin;
          scrollbar-color: #e6dbb9 #f0f0ed;
        }
      `}</style>
    </div>
  );
}
