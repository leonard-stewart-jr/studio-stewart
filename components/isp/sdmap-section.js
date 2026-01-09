import React, { useState, useMemo } from "react";
import sdEvents from "../../data/sd-events";

// Approximate marker positions for SD map SVG (percent coords)
const markerPositions = [
  { left: "73%", top: "86%" }, // Territorial Jail (Yankton)
  { left: "85%", top: "74%" }, // SD State Penitentiary (Sioux Falls)
  { left: "88%", top: "72%" }, // Inmate Labor Quarrying
  { left: "87%", top: "76%" }, // Prison Expansion During Depression
  { left: "86%", top: "78%" }, // Riot and Escape Incident
  { left: "84%", top: "80%" }, // Jameson Annex Constructed
  { left: "62%", top: "93%" }, // Mike Durfee State Prison (Springfield)
  { left: "55%", top: "60%" }, // Justice Reinvestment Initiative
  { left: "83%", top: "72%" }, // COVID-19 Impact
  { left: "56%", top: "59%" }  // Debate over New Prison Construction
];

export default function SDMapSection({ onMarkerClick }) {
  const [hovered, setHovered] = useState(null);

  const markers = useMemo(() => {
    return sdEvents.map((marker, idx) => ({
      marker,
      pos: markerPositions[idx] || { left: "50%", top: "50%" }
    }));
  }, []);

  function firstYear(marker) {
    const ev = marker.timeline?.[0];
    return ev?.year || null;
  }

  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const mapWidth = Math.max(350, Math.min(900, Math.round(vw * 0.97)));
  const mapHeight = Math.max(340, Math.min(660, Math.round(vw * 0.97)));

  return (
    <div
      style={{
        position: "relative",
        width: mapWidth,
        height: mapHeight,
        margin: "0 auto",
        border: "1px solid #e9e7e0",
        borderRadius: 6,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 3px 14px rgba(0,0,0,0.10)"
      }}
    >
      <img
        src="/images/isp/sd_map.svg"
        alt="Map of South Dakota"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {markers.map(({ marker, pos }, i) => (
        <button
          key={i}
          aria-label={`Open ${marker.name}`}
          title={marker.name}
          onClick={() => onMarkerClick?.(marker)}
          onMouseEnter={() => setHovered({ marker, pos })}
          onMouseLeave={() => setHovered(null)}
          style={{
            position: "absolute",
            left: pos.left,
            top: pos.top,
            transform: "translate(-50%, -50%)",
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: "2px solid #fff",
            background: "#e6dbb9",
            cursor: "pointer",
            boxShadow: "0 1px 6px rgba(0,0,0,0.18)"
          }}
        />
      ))}

      {hovered && (
        <div
          style={{
            position: "absolute",
            left: hovered.pos.left,
            top: hovered.pos.top,
            transform: "translate(-50%, calc(-100% - 12px))",
            background: "rgba(0,0,0,0.72)",
            color: "#fff",
            padding: "8px 10px",
            borderRadius: 6,
            minWidth: 160,
            maxWidth: 280,
            pointerEvents: "none",
            fontFamily: "coolvetica, sans-serif",
            fontSize: 12,
            letterSpacing: ".02em"
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{hovered.marker.name}</div>
          {firstYear(hovered.marker) && (
            <div style={{ opacity: 0.85 }}>{firstYear(hovered.marker)}</div>
          )}
        </div>
      )}
    </div>
  );
}