import React, { useState } from "react";
import usaLocations from "../../data/usa-locations";

// Map each event to an approximate position on a USA map SVG using percent coordinates
const markerPositions = [
  { left: "18%", top: "66%" },
  { left: "78%", top: "56%" },
  { left: "84%", top: "40%" },
  { left: "58%", top: "78%" },
  { left: "45%", top: "50%" },
  { left: "10%", top: "54%" },
  { left: "81%", top: "33%" },
  { left: "69%", top: "53%" },
  { left: "30%", top: "62%" },
  { left: "61%", top: "37%" }
];

export default function USAMapSection({ onMarkerClick }) {
  const [hovered, setHovered] = useState(null);

  function getFirstYear(marker) {
    if (marker.timeline && marker.timeline.length > 0) {
      return marker.timeline[0].year;
    }
    return null;
  }

  // Responsive width/height
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const mapWidth = Math.max(350, Math.min(900, vw * 0.97));
  const mapHeight = Math.max(340, Math.min(660, vw * 0.97));

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
        width: mapWidth,
        height: mapHeight,
        maxWidth: 900,
        minWidth: 320,
        aspectRatio: "1 / 1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "18px auto 0 auto",
        position: "relative"
      }}>
        <img
          src="/images/isp/usa_map.svg"
          alt="Map of the United States"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            borderRadius: 8,
            boxShadow: "0 2px 12px rgba(32,32,32,0.12)"
          }}
        />
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
                width: 32,
                height: 32,
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
                width: 20,
                height: 20,
                background: "#b32c2c",
                borderRadius: "50%",
                opacity: 0.85,
                border: "2px solid #fff",
              }} />
            </button>
          );
        })}
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