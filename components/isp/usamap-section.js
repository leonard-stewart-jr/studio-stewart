import React from "react";
import usaLocations from "../../data/usa-locations";

// Map each prison to a plausible position on a US map SVG using percent coordinates
// These will likely need fine-tuning after visual inspection!
const markerPositions = [
  // Alcatraz Island
  { left: "14%", top: "54%" },
  // San Quentin State Prison (very near Alcatraz visually)
  { left: "15%", top: "51%" },
  // Eastern State Penitentiary (Philadelphia)
  { left: "87%", top: "51%" },
  // Sing Sing (New York)
  { left: "84%", top: "36%" },
  // Attica Correctional Facility (Western NY)
  { left: "73%", top: "34%" }
];

export default function USAMapSection({ onMarkerClick }) {
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
        {/* Responsive USA map SVG */}
        <img
          src="/images/isp/usa_map.svg"
          alt="Map of the United States"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            borderRadius: 8,
            boxShadow: "0 2px 12px rgba(32,32,32,0.12)"
          }}
        />
        {/* Markers for each location, positioned using the percent coordinates above */}
        {usaLocations.map((marker, idx) => {
          const pos = markerPositions[idx] || { left: "50%", top: "50%" };
          return (
            <button
              key={marker.name}
              type="button"
              title={marker.name}
              aria-label={marker.name}
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
                  name: marker.name,
                  content: marker.content,
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
