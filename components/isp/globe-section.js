import dynamic from "next/dynamic";
import { useRef } from "react";
import globeLocations from "../../data/globe-locations";
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function GlobeSection({ onMarkerClick }) {
  const globeEl = useRef();
  return (
    <section
      style={{
        width: "100%",
        minHeight: "480px",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "32px",
        paddingBottom: "0",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 16,
          fontSize: 28,
          fontWeight: 600,
          color: "#222",
          letterSpacing: "0.03em",
        }}
      >
        World Timeline
      </h2>
      <div
        style={{
          width: 400,
          height: 400,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          marginTop: "-24px", // Pull globe up
        }}
      >
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          pointsData={globeLocations}
          pointLat={d => d.lat}
          pointLng={d => d.lon}
          pointColor={() => "#b32c2c"}
          pointRadius={0.35}
          onPointClick={onMarkerClick}
          pointAltitude={0.01}
        />
      </div>
    </section>
  );
}
