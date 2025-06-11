import React, { useState } from "react";
import usaLocations from "../../data/usa-locations";

// Map each event to an approximate position on a USA map SVG using percent coordinates
const markerPositions = [
  // Colonial Jails (Jamestown)
  { left: "18%", top: "66%" },
  // Walnut Street Jail Reform (Philadelphia)
  { left: "78%", top: "56%" },
  // Auburn System Developed (Auburn, NY)
  { left: "84%", top: "40%" },
  // 13th Amendment & Convict Leasing (South)
  { left: "58%", top: "78%" },
  // Federal Prison System (Leavenworth)
  { left: "45%", top: "50%" },
  // Alcatraz Opens (San Francisco)
  { left: "10%", top: "54%" },
  // Attica Prison Uprising (New York)
  { left: "81%", top: "33%" },
  // War on Drugs & Mass Incarceration (DC)
  { left: "69%", top: "53%" },
  // Supermax Prisons & Isolation Debate (Colorado)
  { left: "30%", top: "62%" },
  // Decarceration Dialogue (Chicago)
  { left: "61%", top: "37%" }
];

export default function USAMapSection({ onMarkerClick }) {
  const [hovered, setHovered] = useState(null);

  // Helper to get first timeline year for tooltip
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
        {/* Markers for each event, positioned using the percent coordinates */}
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
