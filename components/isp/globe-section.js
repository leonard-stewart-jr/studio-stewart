import dynamic from "next/dynamic";
import { useRef, useState, useMemo, useEffect } from "react";
import globeLocations from "../../data/globe-locations";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Dynamic import because react-globe.gl uses WebGL
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const LONDON_CLUSTER_GROUP = "london";
const LONDON_WHEEL_RADIUS = 1.1;
const LONDON_WHEEL_ALTITUDE = 0.018;

const DOT_SIZE = 0.7;
const DOT_ALTITUDE = 0.012;
const DOT_COLOR = "#b32c2c";

// 3D pin model state (loaded once on client)
let pinModel = null;
let pinModelPromise = null;
function loadPinModel() {
  if (pinModel) return Promise.resolve(pinModel);
  if (pinModelPromise) return pinModelPromise;
  pinModelPromise = new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load("/models/3D_map_pin.glb", (gltf) => {
      // Color the pin body red, leave metal gray
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          if (
            (child.material && child.material.name && child.material.name.toLowerCase().includes("red")) ||
            child.name.toLowerCase().includes("body") ||
            child.name.toLowerCase().includes("pin")
          ) {
            child.material.color.set(DOT_COLOR);
          }
        }
      });
      pinModel = gltf.scene;
      resolve(pinModel);
    }, undefined, reject);
  });
  return pinModelPromise;
}

function getNonLondonMarkers() {
  return globeLocations.filter((m) => m.clusterGroup !== LONDON_CLUSTER_GROUP);
}

// Helper: get a US marker (not London), use "EASTERN STATE PENITENTIARY OPENS" if possible
function getComparisonMarkerIdx(nonLondonMarkers) {
  const idx = nonLondonMarkers.findIndex(m => 
    m.name.toLowerCase().includes("eastern state") || m.name.toLowerCase().includes("united states")
  );
  return idx !== -1 ? idx : 0;
}

export default function GlobeSection({ onMarkerClick }) {
  const globeEl = useRef();
  const globeContainerRef = useRef();
  const [pinReady, setPinReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadPinModel().then(() => {
      if (mounted) setPinReady(true);
    });
    return () => { mounted = false; };
  }, []);

  const {
    objectsData,
    customPointObject
  } = useMemo(() => {
    const nonLondonMarkers = getNonLondonMarkers();
    const comparisonMarkerIdx = getComparisonMarkerIdx(nonLondonMarkers);

    let objectsData = [];
    let customPointObject = undefined;

    objectsData = [
      {
        ...nonLondonMarkers[comparisonMarkerIdx],
        lat: nonLondonMarkers[comparisonMarkerIdx].lat,
        lng: nonLondonMarkers[comparisonMarkerIdx].lon,
        markerId: nonLondonMarkers[comparisonMarkerIdx].name,
        isStandardPin: true,
        showHelper: true,
        altitude: DOT_ALTITUDE,
      }
    ];

    customPointObject = (obj) => {
      if (obj.isStandardPin && pinModel) {
        const group = new THREE.Group();

        // 3D Pin at large scale
        const scale = 100; // LARGE for debugging
        const pin = pinModel.clone(true);
        pin.traverse((child) => {
          if (child.isMesh) child.castShadow = false;
        });
        pin.scale.set(scale, scale, scale);
        pin.position.set(0, 0, 0);

        group.add(pin);

        // Helper box at origin
        if (obj.showHelper) {
          const helperBox = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
          );
          group.add(helperBox);
        }

        // Debug: log bounding box and position
        const box = new THREE.Box3().setFromObject(pin);
        const size = box.getSize(new THREE.Vector3());
        console.log(
          "[DEBUG] Rendering ONLY 3D pin for marker:",
          obj.markerId,
          "Scale:", scale,
          "BBox size:", size,
          "Pin position:", pin.position,
          "Pin model:", pin
        );

        group.userData = { markerId: obj.markerId };
        return group;
      }
      return null;
    };

    return { objectsData, customPointObject };
  }, [pinReady]);

  // Responsive globe sizing
  const bannerHeight = 76 + 44 + 26 + 16;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const availHeight = Math.max(380, vh - bannerHeight);
  const globeWidth = Math.max(500, Math.min(950, vw * 0.93)) * 1.3;
  const globeHeight = Math.max(460, Math.min(availHeight, vw * 0.60)) * 1.3;
  const isMobile = vw < 800;

  // Wait for pin model to be ready
  if (!pinReady) {
    return (
      <section
        className="isp-globe-section"
        style={{
          width: "100vw",
          minHeight: availHeight,
          height: availHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          color: "#b32c2c",
        }}
      >
        Loading globe...
      </section>
    );
  }

  return (
    <section
      className="isp-globe-section"
      style={{
        width: "100vw",
        minHeight: availHeight,
        height: availHeight,
        background: "transparent",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 0,
        paddingBottom: 0,
        margin: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        position: "relative",
        marginTop: 57,
      }}
    >
      {/* Globe on the left */}
      <div
        ref={globeContainerRef}
        style={{
          flex: "0 1 auto",
          width: globeWidth,
          height: globeHeight,
          maxWidth: 950 * 1.3,
          minWidth: 340 * 1.3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: isMobile ? "0 auto 24px auto" : "0 0 0 0",
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
          backgroundColor="rgba(0,0,0,0)"
          width={globeWidth}
          height={globeHeight}
          pointsData={[]} // <--- NO POINTS, ONLY OBJECTS
          objectsData={objectsData}
          objectLat="lat"
          objectLng="lng"
          objectAltitude={(obj) => obj.altitude || DOT_ALTITUDE}
          objectThreeObject={customPointObject}
        />
      </div>
    </section>
  );
}
