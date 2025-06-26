import dynamic from "next/dynamic";
import { useRef, useState, useMemo, useEffect } from "react";
import globeLocations from "../../data/globe-locations";

// Dynamic import because react-globe.gl uses WebGL
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function GlobeSection({ onMarkerClick }) {
  const globeEl = useRef();
  const [hovered, setHovered] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Prepare pointsData for react-globe.gl built-in approach
  const pointsData = useMemo(
    () =>
      globeLocations.map((marker) => ({
        ...marker,
        lat: marker.lat,
        lng: marker.lon, // <-- CRITICAL: use lng not lon for react-globe.gl
        color:
          marker.clusterGroup === "london"
            ? "#b32c2c"
            : "#224488",
        size: marker.clusterGroup === "london" ? 1.6 : 1.2,
        year:
          marker.timeline && marker.timeline.length > 0
            ? marker.timeline[0].year
            : "",
      })),
    []
  );

  // Log the pointsData for debugging
  console.log("GlobeSection pointsData:", pointsData);

  // Responsive width/height
  const vw =
    typeof window !== "undefined" ? window.innerWidth : 1400;
  const globeWidth = Math.max(380, Math.min(950, vw * 0.88));
  const globeHeight = Math.max(340, Math.min(520, vw * 0.42));

  // Tooltip mouse position tracking
  useEffect(() => {
    const handleMouseMove = (e) =>
      setMouse({ x: e.clientX, y: e.clientY });
    if (hovered) window.addEventListener("mousemove", handleMouseMove);
    else setMouse({ x: 0, y: 0 });
    return () =>
      window.removeEventListener("mousemove", handleMouseMove);
  }, [hovered]);

  return (
    <section
      className="isp-globe-section"
      style={{
        width: "100vw",
        minHeight: 0,
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: "-10px",
        marginBottom: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: globeWidth,
          height: globeHeight,
          maxWidth: 950,
          minWidth: 320,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 auto",
          padding: 0,
          background: "transparent",
          overflow: "unset",
          position: "relative",
          borderRadius: 0,
          boxShadow: "none",
        }}
      >
        <Globe
          ref={globeEl}
          globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="size"
          pointAltitude={0.012}
          onPointHover={setHovered}
          onPointClick={onMarkerClick}
          backgroundColor="rgba(0,0,0,0)"
          width={globeWidth}
          height={globeHeight}
        />
        {/* Tooltip for marker hover */}
        {hovered && (
          <div
            style={{
              position: "fixed",
              left: mouse.x + 18,
              top: mouse.y + 18,
              zIndex: 100,
              pointerEvents: "none",
              background: "#fff",
              color: "#181818",
              borderRadius: 7,
              boxShadow: "0 1.5px 12px rgba(32,32,32,0.15)",
              padding: "10px 16px",
              fontFamily:
                "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: 15,
              minWidth: 120,
              maxWidth: 260,
              border: "1px solid #e6dbb9",
              opacity: 0.98,
              transition: "opacity 0.15s",
              lineHeight: "1.32",
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {hovered.name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#b1b1ae",
                marginTop: 2,
                fontWeight: 400,
              }}
            >
              {hovered.year}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
