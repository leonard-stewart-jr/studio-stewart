import dynamic from "next/dynamic";
import { useRef } from "react";
import * as THREE from "three";

// Dynamic import because react-globe.gl uses WebGL
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function GlobeSection() {
  const globeEl = useRef();

  // This is a single test point at the equator
  const customLayerData = [
    { lat: 0, lon: 0, name: "Test Dot" }
  ];

  function renderDot(marker) {
    const geometry = new THREE.SphereGeometry(1.1, 24, 24);
    const material = new THREE.MeshBasicMaterial({ color: "#b32c2c" });
    return new THREE.Mesh(geometry, material);
  }

  return (
    <section style={{
      width: "100vw",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 0,
      paddingBottom: 0,
      marginTop: "-10px",
      marginBottom: 0,
      overflow: "hidden",
    }}>
      <div style={{
        width: 500,
        height: 400,
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
      }}>
        <Globe
          ref={globeEl}
          globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
          customLayerData={customLayerData}
          customThreeObject={renderDot}
          pointsData={[]} // hide default points
          backgroundColor="rgba(0,0,0,0)"
          width={500}
          height={400}
        />
      </div>
    </section>
  );
}
