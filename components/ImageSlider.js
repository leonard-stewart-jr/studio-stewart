import React, { useState } from "react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

// Accepts array of { src, label }
export default function ImageSlider({ images }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Handle slider change
  const handleSliderChange = value => {
    // Map slider value (0-100) to image index
    const idx = Math.round((value / 100) * (images.length - 1));
    setCurrentIdx(idx);
  };

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
      {/* Main image */}
      <img
        src={images[currentIdx].src}
        alt={images[currentIdx].label}
        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 0, display: "block" }}
      />
      {/* Label in bottom-left, inherit from global CSS */}
      <div
        style={{
          position: "absolute",
          left: 16,
          bottom: 16,
          background: "rgba(32,32,32,0.75)",
          color: "#fff",
          padding: "6px 14px",
          borderRadius: 6,
          fontSize: 16,
          fontFamily: "inherit", // Should use your global font
          letterSpacing: ".02em",
          pointerEvents: "none",
        }}
      >
        {images[currentIdx].label}
      </div>
      {/* Simple horizontal slider */}
      <input
        type="range"
        min={0}
        max={images.length - 1}
        value={currentIdx}
        onChange={e => setCurrentIdx(Number(e.target.value))}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          margin: 0,
          zIndex: 2,
          background: "transparent",
        }}
        aria-label="Time of day slider"
      />
    </div>
  );
}
