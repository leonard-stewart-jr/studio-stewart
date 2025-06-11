import React, { useState } from "react";
import sdEvents from "../../data/sd-events";

// Approximate marker positions for each event on SD map SVG
const markerPositions = [
  // Dakota Territorial Jail (Yankton)
  { left: "73%", top: "86%" },
  // SD State Penitentiary (Sioux Falls)
  { left: "85%", top: "74%" },
  // Inmate Labor for Quarrying (Sioux Falls, offset)
  { left: "88%", top: "72%" },
  // Prison Expansion (Depression era) (Sioux Falls, offset)
  { left: "87%", top: "76%" },
  // Riot and Escape Incident (Sioux Falls, offset)
  { left: "86%", top: "78%" },
  // Jameson Annex (Sioux Falls, offset)
  { left: "84%", top: "80%" },
  // Mike Durfee State Prison (Springfield)
  { left: "62%", top: "93%" },
  // Justice Reinvestment (Pierre, capital)
  { left: "55%", top: "60%" },
  // COVID-19 Impact (Sioux Falls)
  { left: "83%", top: "72%" },
  // New Prison Construction (Pierre)
  { left: "56%", top: "59%" }
];

export default function SDMapSection({ onMarkerClick }) {
  const [hovered, setHovered] = useState(null);

  function getFirstYear(marker) {
    if (marker.timeline && marker.timeline.length > 0) {
      return marker.timeline[0].year;
    }
    return null;
  }

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
        {/* Markers for each event */}
        {sdEvents.map((marker, idx) => {
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
              onClick={() => onMarkerClick(marker)}
              onMouseEnter={() => setHovered({ marker, pos })}
              onMouseLeave={() => setHovered(null)}
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
        {/* Tooltip for marker hover */}
        {hovered && (
          <div
            style={{
              position: "absolute",
              left: hovered.pos.left,
              top: `calc(${hovered.pos.top} + 32px)`,
              zIndex: 100,
              pointerEvents: "none",
              background: "#fff",
              color: "#181818",
              borderRadius: 7,
              boxShadow: "0 1.5px 12px rgba(32,32,32,0.15)",
              padding: "10px 16px",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: 15,
              minWidth: 120,
              maxWidth: 260,
              border: "1px solid #e6dbb9",
              opacity: 0.98,
              transition: "opacity 0.15s",
              lineHeight: "1.32",
              transform: "translate(-50%, 0)"
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {hovered.marker.name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#b1b1ae",
                marginTop: 2,
                fontWeight: 400,
              }}
            >
              {getFirstYear(hovered.marker)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
