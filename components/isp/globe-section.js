import dynamic from "next/dynamic";
import { useRef, useEffect, useState } from "react";
import globeLocations from "../../data/globe-locations";

// Dynamic import because react-globe.gl uses WebGL
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function GlobeSection({ onMarkerClick }) {
  const globeEl = useRef();
  const [hovered, setHovered] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Center the globe on the US
  useEffect(() => {
    if (
      globeEl.current &&
      typeof globeEl.current.pointOfView === "function"
    ) {
      globeEl.current.pointOfView({ lat: 39.6, lng: -98.5, altitude: 2 });
    }
  }, []);

  // Disable zoom (scroll wheel / pinch) on the globe
  useEffect(() => {
    if (
      globeEl.current &&
      typeof globeEl.current.controls === "function" &&
      globeEl.current.controls()
    ) {
      globeEl.current.controls().enableZoom = false;
    }
  }, []);

  // Mouse move listener for tooltip position
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    if (hovered) {
      window.addEventListener("mousemove", handleMouseMove);
    } else {
      setMouse({ x: 0, y: 0 });
    }
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hovered]);

  // Helper to get first timeline year for tooltip
  function getFirstYear(marker) {
    if (marker.timeline && marker.timeline.length > 0) {
      return marker.timeline[0].year;
    }
    return null;
  }

  return (
    <section
      style={{
        width: "100%",
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 0,
        paddingBottom: 0,
      }}
    >
      <div
        style={{
          width: "80vw",
          maxWidth: 900,
          minWidth: 300,
          height: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          margin: "-40px auto 0 auto", // move globe UP by 40px
          padding: 0,
          background: "transparent",
          overflow: "visible",
          position: "relative",
        }}
      >
        <Globe
          ref={globeEl}
          globeImageUrl="/images/isp/globe.png"
          pointsData={globeLocations}
          pointLat={d => d.lat}
          pointLng={d => d.lon}
          pointColor={() => "#b32c2c"}
          pointRadius={0.65}
          onPointClick={onMarkerClick}
          pointAltitude={0.01}
          backgroundColor="rgba(0,0,0,0)"
          width={undefined}
          height={undefined}
          onPointHover={setHovered}
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
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: 15,
              minWidth: 120,
              maxWidth: 260,
              border: "1px solid #e6dbb9",
              opacity: 0.98,
              transition: "opacity 0.15s",
              lineHeight: "1.32"
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
              {getFirstYear(hovered)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
