import React from "react";
import sdEvents from "../../data/sd-events";

// Visually estimated marker positions for a SD map SVG (edit as needed for accuracy)
const markerPositions = [
  // Pierre (central SD)
  { left: "50%", top: "53%" },
  // Expansion (also Pierre, just offset for clarity)
  { left: "53%", top: "56%" },
  // Reform Initiatives (also Pierre, just offset for clarity)
  { left: "47%", top: "50%" }
];

export default function SDMapSection({ onMarkerClick }) {
  return (
    <section style={{
      width: "100%",
      background: "transparent",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 0,
      paddingBottom: 0,
    }}>
      <div style={{
        width: "90vw",
        maxWidth: 600,
        minWidth: 300,
        aspectRatio: "1 / 1",
        height: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "18px auto 0 auto",
        position: "relative"
      }}>
        {/* Responsive SD map SVG */}
        <img
          src="/images/isp/sd_map.svg"
          alt="Map of South Dakota"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            borderRadius: 8,
            boxShadow: "0 2px 12px rgba(32,32,32,0.12)"
          }}
        />
        {/* Markers for each event, positioned using the percent coordinates above */}
        {sdEvents.map((ev, idx) => {
          const pos = markerPositions[idx] || { left: "50%", top: "50%" };
          return (
            <button
              key={ev.name}
              type="button"
              title={ev.name}
              aria-label={ev.name}
              style={{
                position: "absolute",
                left: pos.left,
                top: pos.top,
                transform: "translate(-50%, -50%)",
                width: 26,
                height: 26,
                background: "rgba(255,255,255,0.88)",
                border: "3px solid #b32c2c",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px #2222",
                zIndex: 2,
                transition: "box-shadow 0.12s",
              }}
              onClick={() =>
                onMarkerClick({
                  year: ev.year,
                  name: ev.name,
                  content: ev.content,
                })
              }
            >
              <div style={{
                width: 14,
                height: 14,
                background: "#b32c2c",
                borderRadius: "50%",
                opacity: 0.85,
                border: "2px solid #fff",
              }} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
