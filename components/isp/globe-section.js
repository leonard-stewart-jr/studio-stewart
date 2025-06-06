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
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 0,
        paddingBottom: 0,
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 20,
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
          width: "80vw",
          maxWidth: 900,
          minWidth: 300,
          aspectRatio: "1 / 1",
          height: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "40px auto",
          padding: 0,
        }}
      >
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
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
