import dynamic from "next/dynamic";
import { useRef, useEffect } from "react";
import globeLocations from "../../data/globe-locations";

// Dynamic import because react-globe.gl uses WebGL
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function GlobeSection({ onMarkerClick }) {
  const globeEl = useRef();

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
          // Your custom markers
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
        />
      </div>
    </section>
  );
}
