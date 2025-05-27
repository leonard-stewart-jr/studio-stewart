import React from "react";
import ImageSlider from "./ImageSlider";
import ScrollableBanner from "./ScrollableBanner";

export default function ProjectModal({ project, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          padding: 32,
          gap: 36,
          maxWidth: "95vw",
          maxHeight: "90vh",
          alignItems: "flex-start",
          position: "relative"
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 24,
            fontSize: 32,
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
            zIndex: 10
          }}
          aria-label="Close"
        >
          &times;
        </button>
        <div style={{ width: 300, minWidth: 240 }}>
          <ImageSlider images={project.sliderImages} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 22 }}>
            {project.title}
          </div>
          <ScrollableBanner
            src={project.bannerSrc}
            height={600}
            alt={project.title + " banner"}
          />
        </div>
      </div>
    </div>
  );
}
