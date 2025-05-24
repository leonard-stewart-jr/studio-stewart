import { useRef, useEffect, useState, useCallback } from "react";

export default function ProjectModal({ project, onClose }) {
  const scrollRef = useRef(null);
  const scrollAnimationRef = useRef(null);
  const scrollDirectionRef = useRef(0); // -1 for left, 1 for right, 0 for stop

  // For gradient visibility
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Allow closing with Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Hover-to-scroll for desktop
  const startScroll = useCallback((dir) => {
    scrollDirectionRef.current = dir;
    if (!scrollAnimationRef.current) {
      scrollAnimationRef.current = requestAnimationFrame(scrollStep);
    }
  }, []);

  const stopScroll = useCallback(() => {
    scrollDirectionRef.current = 0;
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  }, []);

  // Needs to be outside useCallback to be hoisted for requestAnimationFrame
  function scrollStep() {
    if (!scrollRef.current || scrollDirectionRef.current === 0) {
      scrollAnimationRef.current = null;
      return;
    }
    const speed = 18; // pixels/frame
    scrollRef.current.scrollLeft += scrollDirectionRef.current * speed;
    scrollAnimationRef.current = requestAnimationFrame(scrollStep);
  }

  // Clean up on unmount
  useEffect(() => stopScroll, [stopScroll]);

  // Mouse move detection for edge zones (desktop only)
  const handleMouseMove = (e) => {
    if (!scrollRef.current) return;
    const { left, width } = scrollRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const edgeZone = Math.max(80, width * 0.14);

    if (x < edgeZone) {
      startScroll(-1); // Scroll left
    } else if (x > width - edgeZone) {
      startScroll(1); // Scroll right
    } else {
      stopScroll();
    }
  };

  // Determine gradient visibility based on scroll position
  const updateCanScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
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
          onMouseMove={handleMouseMove}
          onMouseLeave={stopScroll}
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
