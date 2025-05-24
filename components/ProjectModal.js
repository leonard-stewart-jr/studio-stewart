import { useState, useRef } from "react";

export default function ProjectModal({
  project,
  onClose,
}) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const galleryLength = project.media.length;

  // Handle left/right click areas for media navigation
  const handleMediaAreaClick = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    if (x < bounds.width / 2) {
      // Left half: go previous
      setMediaIndex((i) => Math.max(0, i - 1));
    } else {
      // Right half: go next
      setMediaIndex((i) => Math.min(galleryLength - 1, i + 1));
    }
  };

  // Optional: swipe support for touch devices
  const touchStart = useRef();
  const onTouchStart = (e) => (touchStart.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStart.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (delta > 50 && mediaIndex > 0) setMediaIndex(mediaIndex - 1);
    else if (delta < -50 && mediaIndex < galleryLength - 1) setMediaIndex(mediaIndex + 1);
    touchStart.current = null;
  };

  if (!project) return null;
  const currentMedia = project.media[mediaIndex];

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
      tabIndex={0}
      aria-modal="true"
      role="dialog"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
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
        {/* Media gallery area */}
        <div
          style={{
            width: "min(80vw,900px)",
            maxHeight: "70vh",
            margin: "0 auto",
            position: "relative",
            cursor: galleryLength > 1 ? "pointer" : "auto",
            userSelect: "none"
          }}
          onClick={galleryLength > 1 ? handleMediaAreaClick : undefined}
        >
          {currentMedia.type === "video" ? (
            <video
              src={currentMedia.src}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: 8,
                background: "#eee",
                display: "block",
              }}
            />
          ) : (
            <img
              src={currentMedia.src}
              alt={currentMedia.caption || project.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: 8,
                background: "#eee",
                display: "block",
              }}
            />
          )}
          {/* Optional: Show caption */}
          {currentMedia.caption && (
            <div style={{
              position: "absolute",
              bottom: 10,
              left: 0,
              width: "100%",
              textAlign: "center",
              color: "#444",
              fontSize: 15,
              background: "rgba(255,255,255,0.75)",
              padding: "3px 0"
            }}>
              {currentMedia.caption}
            </div>
          )}
        </div>
        {/* Project info */}
        <div
          style={{
            width: "min(80vw,900px)",
            padding: "24px 12px 16px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
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
        {/* Close button */}
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
        {/* Optional: Show media index if there are multiple */}
        {galleryLength > 1 && (
          <div style={{
            position: "absolute",
            bottom: 10,
            right: 18,
            fontSize: 15,
            color: "#888",
            background: "rgba(255,255,255,0.7)",
            padding: "2px 8px",
            borderRadius: 6
          }}>
            {mediaIndex + 1} / {galleryLength}
          </div>
        )}
      </div>
    </div>
  );
}
