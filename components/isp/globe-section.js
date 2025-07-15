import dynamic from "next/dynamic";
import { useRef, useState, useMemo, useEffect } from "react";
import globeLocations from "../../data/globe-locations";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const DOT_ALTITUDE = 0.012;
const DOT_COLOR = "#b32c2c";

// Pin model cache
let pinModel = null;
let pinModelPromise = null;
function loadPinModel() {
  if (pinModel) return Promise.resolve(pinModel);
  if (pinModelPromise) return pinModelPromise;
  pinModelPromise = new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load("/models/3D_map_pin.glb", (gltf) => {
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

function latLngAltToVec3(lat, lng, altitude = 0) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const r = 1 + altitude;
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

// Manual best-guess rotations for each pin (adjust as needed)
function getPinRotation(marker) {
  // EASTERN STATE PENITENTIARY: default "tip in globe" orientation
  if (marker.name.toLowerCase().includes("eastern state")) {
    return null; // Use standard orientation
  }
  // MESOPOTAMIA: THE FIRST PRISONS
  if (marker.name.toLowerCase().includes("mesopotamia")) {
    return { axis: new THREE.Vector3(1, 0, 0), angle: Math.PI * 0.22 };
  }
  // THE MAMERTINE PRISON (ROME)
  if (marker.name.toLowerCase().includes("mamertine")) {
    return { axis: new THREE.Vector3(0, 0, 1), angle: Math.PI * 0.12 };
  }
  // MAISON DE FORCE (GHENT)
  if (marker.name.toLowerCase().includes("maison de force")) {
    return { axis: new THREE.Vector3(-1, 0, 0), angle: Math.PI * 0.18 };
  }
  // SCANDINAVIAN PRISON REFORM (NORWAY/SWEDEN)
  if (marker.name.toLowerCase().includes("scandinavian")) {
    return { axis: new THREE.Vector3(0, 1, 0), angle: Math.PI * 0.1 };
  }
  // THE RISE OF THE NAZI CAMP SYSTEM (POLAND)
  if (marker.name.toLowerCase().includes("nazi")) {
    return { axis: new THREE.Vector3(0.6, 0.4, 0), angle: Math.PI * 0.18 };
  }
  // BRITISH PENAL COLONIES (AUSTRALIA)
  if (marker.name.toLowerCase().includes("penal") || marker.name.toLowerCase().includes("australia")) {
    return { axis: new THREE.Vector3(0, 0, 1), angle: Math.PI * 0.26 };
  }
  // LONDON CLUSTER: use standard orientation for all
  if (marker.clusterGroup === "london") {
    return null;
  }
  // Default: use standard orientation
  return null;
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

  // All markers, including cluster group
  const objectsData = useMemo(() =>
    globeLocations.map(marker => ({
      ...marker,
      lat: marker.lat,
      lng: marker.lon,
      markerId: marker.name,
      isStandardPin: true,
      altitude: DOT_ALTITUDE,
    })),
    []
  );

  const customPointObject = useMemo(() => {
    return (obj) => {
      if (!pinModel || !obj.isStandardPin) return null;

      const group = new THREE.Group();
      const scale = 200;
      const pin = pinModel.clone(true);
      pin.traverse(child => {
        if (child.isMesh) child.castShadow = false;
      });
      pin.scale.set(scale, scale, scale);

      // Pin position vector
      const markerVec = latLngAltToVec3(obj.lat, obj.lng, obj.altitude);

      // Default orientation: tip points toward globe center (standard "stuck in" look)
      let quaternion;
      const up = new THREE.Vector3(0, -1, 0);
      const standardTarget = markerVec.clone().normalize().negate();

      // Manual override for specific pins
      const manual = getPinRotation(obj);
      if (manual) {
        quaternion = new THREE.Quaternion().setFromAxisAngle(
          manual.axis,
          manual.angle
        );
      } else {
        quaternion = new THREE.Quaternion().setFromUnitVectors(up, standardTarget);
      }
      pin.setRotationFromQuaternion(quaternion);

      // "Pull out" offset along surface normal
      const offset = 0.08;
      const outwardVec = markerVec.clone().normalize().multiplyScalar(offset);
      pin.position.copy(outwardVec);

      group.add(pin);
      group.userData = { markerId: obj.markerId };
      return group;
    };
  }, [pinReady]);

  // Responsive globe sizing (unchanged)
  const bannerHeight = 76 + 44 + 26 + 16;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const availHeight = Math.max(380, vh - bannerHeight);
  const globeWidth = Math.max(500, Math.min(950, vw * 0.93)) * 1.3;
  const globeHeight = Math.max(460, Math.min(availHeight, vw * 0.60)) * 1.3;
  const isMobile = vw < 800;

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
          pointsData={[]} // Only objects, no points
          objectsData={objectsData}
          objectLat="lat"
          objectLng="lng"
          objectAltitude={obj => obj.altitude || DOT_ALTITUDE}
          objectThreeObject={customPointObject}
        />
      </div>
    </section>
  );
}
