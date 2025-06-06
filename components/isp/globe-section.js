import dynamic from "next/dynamic";
import { useRef } from "react";
import globeLocations from "../../data/globe-locations";
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function GlobeSection({ onMarkerClick }) {
  const globeEl = useRef();
  return (
    <section style={{ width: "100%", minHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fff" }}>
      <h2 style={{ marginTop: 32, marginBottom: 24, fontSize: 32, color: "#222" }}>World History: Prisons Across the Globe</h2>
      <div style={{ width: 400, height: 400 }}>
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
