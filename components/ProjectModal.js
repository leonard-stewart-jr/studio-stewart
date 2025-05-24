import { useRef, useEffect, useState, useCallback } from "react";

export default function ProjectModal({ project, onClose }) {
  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Scroll to the given panel index (0 = description, 1+ = media)
  const scrollToIndex = useCallback(
    (idx) => {
      if (!scrollRef.current) return;
      const children = Array.from(scrollRef.current.children);
      if (!children[idx]) return;
      children[idx].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      setCurrentIndex(idx);
    },
    [setCurrentIndex]
  );

  // Sync scroll position to update currentIndex, gradients, etc.
  const updateCanScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);

    // Find which panel is mostly in view
    const children = Array.from(el.children);
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
  }, []);

  useEffect(() => {
    updateCanScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateCanScroll, { passive: true });
    window.addEventListener("resize", updateCanScroll);
    return () => {
      el.removeEventListener("scroll", updateCanScroll);
      window.removeEventListener("resize", updateCanScroll);
    };
  }, [updateCanScroll]);

  // Allow closing with Escape key and gallery left/right with arrows
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
    // eslint-disable-next-line
  }, [project]);

  if (!project) return null;

  // Click zone handlers
  const handleLeftClick = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) scrollToIndex(currentIndex - 1);
  };
  const handleRightClick = (e) => {
    e.stopPropagation();
    if (currentIndex < project.media.length) scrollToIndex(currentIndex + 1);
  };

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
        onClick={e => e.stopPropagation()}
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
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            cursor: "pointer",
            position: "relative",
          }}
        >
          {/* Gradients */}
          {canScrollLeft && (
            <div
              style={{
                pointerEvents: "none",
                position: "absolute",
                left: 0,
                top: 0,
                width: "60px",
                height: "100%",
                zIndex: 5,
                background: "linear-gradient(to right, rgba(255,255,255,0.97) 80%, rgba(255,255,255,0) 100%)",
                transition: "opacity 0.2s"
              }}
            />
          )}
          {canScrollRight && (
            <div
              style={{
                pointerEvents: "none",
                position: "absolute",
                right: 0,
                top: 0,
                width: "60px",
                height: "100%",
                zIndex: 5,
                background: "linear-gradient(to left, rgba(255,255,255,0.97) 80%, rgba(255,255,255,0) 100%)",
                transition: "opacity 0.2s"
              }}
            />
          )}

          {/* LEFT CLICK ZONE */}
          {currentIndex > 0 && (
            <div
              onClick={handleLeftClick}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "18vw",
                height: "100%",
                zIndex: 10,
                cursor: "pointer",
                background: "rgba(0,0,0,0)",
              }}
              aria-label="Previous"
              tabIndex={-1}
            />
          )}
          {/* RIGHT CLICK ZONE */}
          {currentIndex < project.media.length && (
            <div
              onClick={handleRightClick}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "18vw",
                height: "100%",
                zIndex: 10,
                cursor: "pointer",
                background: "rgba(0,0,0,0)",
              }}
              aria-label="Next"
              tabIndex={-1}
            />
          )}

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
      {/* Hide scrollbars (optional) */}
      <style jsx global>{`
        div[role="dialog"]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
