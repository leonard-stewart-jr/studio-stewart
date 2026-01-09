import React, { useState, useMemo } from "react";
import usaLocations from "../../data/usa-locations";

// Approximate marker positions on a USA map SVG using percent coordinates
const markerPositions = [
  { left: "18%", top: "66%" }, // Colonial Jails
  { left: "78%", top: "56%" }, // Walnut Street Jail
  { left: "84%", top: "40%" }, // Auburn System
  { left: "58%", top: "78%" }, // 13th Amendment & Convict Leasing
  { left: "45%", top: "50%" }, // Federal Prison System
  { left: "10%", top: "54%" }, // Alcatraz
  { left: "81%", top: "33%" }, // Attica
  { left: "69%", top: "53%" }, // War on Drugs
  { left: "30%", top: "62%" }, // Supermax (ADX CO)
  { left: "61%", top: "37%" }  // Decarceration & Abolition
];

export default function USAMapSection({ onMarkerClick }) {
  const [hovered, setHovered] = useState(null);

  const markers = useMemo(() => {
    return usaLocations.map((marker, idx) => ({
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
        src="/images/isp/usa_map.svg"
        alt="Map of the United States"
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