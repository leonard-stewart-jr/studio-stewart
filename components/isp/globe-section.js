import dynamic from "next/dynamic";
import { useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import {
  loadPinModel,
  getPinModel,
  orientPin,
  latLngAltToVec3,
  positionPin,
  getPinPalette,
  getPaletteAssignments,
  loadFlagModel,
  getFlagModel
} from "./modal/pin-utils";

import globeLocations from "../../data/globe-locations";
import usaLocations from "../../data/usa-locations";
import sdEvents from "../../data/sd-events";

// react-globe.gl must be client-only
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

// Constants for pin sizing and altitude
const NORMAL_PIN_SCALE = 9 * 1.5;
const DOT_ALTITUDE = 0.012;
const LONDON_CLUSTER_GROUP = "london";

const GLOBE_IMAGES = {
  world: "/images/globe/world-hd.jpg",
  usa: "/images/globe/usa-hd.jpg",
  sd: "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
};

// If you want world pins to use a fixed palette (first N colors), list them here.
// Fallback goes to getPinPalette(mode).
const WORLD_PIN_COLORS = [
  "#906c5c", "#cc853e", "#3B3A30", "#bd9778", "#b6b09a", "#7e6651",
  "#7C6F57", "#A3B18A", "#A0522D", "#C19A6B", "#8a451f"
];

function toRoman(num) {
  const map = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  let result = "";
  for (let [n, sym] of map) {
    while (num >= n) {
      result += sym;
      num -= n;
    }
  }
  return result;
}

function getInitialPOV(mode) {
  if (mode === "world") return { lat: 20, lng: 0, altitude: 2.0 };
  if (mode === "usa") return { lat: 39, lng: -98, altitude: 1.2 };
  return { lat: 44, lng: -100, altitude: 1.5 }; // sd
}

export default function GlobeSection({ onMarkerClick, mode = "world" }) {
  const globeEl = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [londonExpanded, setLondonExpanded] = useState(false);
  const [pinReady, setPinReady] = useState(false);
  const [flagReady, setFlagReady] = useState(false);

  // Load GLB models for pins and flags once (client)
  useEffect(() => {
    let alive = true;
    loadPinModel().then(() => { if (alive) setPinReady(true); });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    let alive = true;
    loadFlagModel().then(() => { if (alive) setFlagReady(true); });
    return () => { alive = false; };
  }, []);

  // Pick dataset and palette by mode
  const data = useMemo(() => {
    if (mode === "world") return globeLocations;
    if (mode === "usa") return usaLocations;
    return sdEvents;
  }, [mode]);

  const palette = useMemo(() => getPinPalette(mode), [mode]);
  const colorAssignments = useMemo(() => {
    if (mode === "world") {
      // First N markers get fixed colors; fallback to palette
      return data.map((_, i) =>
        i < WORLD_PIN_COLORS.length
          ? WORLD_PIN_COLORS[i]
          : (palette && palette.length ? palette[i % palette.length] : "#b32c2c")
      );
    }
    // USA / SD: use palette assignments
    return getPaletteAssignments(data.length, 42, palette);
  }, [data, palette, mode]);

  const globeImageUrl = GLOBE_IMAGES[mode];

  // Prepare objectsData to feed react-globe.gl's custom three object, and the TOC list
  const { objectsData, customPointObject, tocList } = useMemo(() => {
    const pinModel = getPinModel();
    const flagModel = getFlagModel();

    // Table of contents list (exclude the "EXPAND" placeholder marker)
    const toc = data
      .filter(m => !m.clusterExpand)
      .map((marker, idx) => {
        const year = marker.timeline?.[0]?.year || "";
        return {
          idx,
          roman: toRoman(idx + 1),
          name: marker.name,
          marker,
          year,
          color: colorAssignments[idx]
        };
      });

    // World mode: include special "EXPAND" flag for London, and optionally expand cluster markers
    if (mode === "world") {
      const expandMarker = data.find(m => m.clusterExpand) || { lat: 51.512, lon: -0.097 };
      const londonMarkers = data.filter(m => m.clusterGroup === LONDON_CLUSTER_GROUP);
      const nonLondonMarkers = data.filter(m => m.clusterGroup !== LONDON_CLUSTER_GROUP && !m.clusterExpand);

      let entries = [];

      if (!londonExpanded) {
        // Non-London markers + single "EXPAND" flag
        entries = [
          ...nonLondonMarkers.map(m => ({
            ...m,
            lat: m.lat,
            lng: m.lon,
            altitude: DOT_ALTITUDE,
            markerId: m.name,
            label: m.name,
            type: "pin",
            color: colorAssignments[data.indexOf(m)]
          })),
          {
            lat: expandMarker.lat,
            lng: expandMarker.lon,
            altitude: DOT_ALTITUDE,
            markerId: "EXPAND",
            label: "EXPAND",
            type: "flag",
            color: "#e6dbb9"
          }
        ];
      } else {
        // Expand London markers radially around cluster center
        const N = londonMarkers.length;
        const radius = 1.2; // degrees
        entries = [
          ...nonLondonMarkers.map(m => ({
            ...m,
            lat: m.lat,
            lng: m.lon,
            altitude: DOT_ALTITUDE,
            markerId: m.name,
            label: m.name,
            type: "pin",
            color: colorAssignments[data.indexOf(m)]
          })),
          ...londonMarkers.map((m, i) => {
            const angle = (2 * Math.PI * i) / Math.max(N, 1);
            const lat = expandMarker.lat + radius * Math.cos(angle);
            const lng = expandMarker.lon + radius * Math.sin(angle);
            return {
              ...m,
              lat,
              lng,
              altitude: DOT_ALTITUDE,
              markerId: m.name,
              label: m.name,
              type: "pin",
              color: colorAssignments[data.indexOf(m)]
            };
          })
        ];
      }

      // Build a custom three object for each entry
      const objectFactory = (obj) => {
        if (obj.type === "flag" && flagModel) {
          const group = new THREE.Group();
          const markerVec = latLngAltToVec3(obj.lat, obj.lng, obj.altitude);
          const flag = flagModel.clone(true);
          const scale = NORMAL_PIN_SCALE * 1.09 * 0.5;
          flag.scale.set(scale, scale, scale);
          orientPin(flag, markerVec);
          flag.rotateZ(Math.PI / 4);
          positionPin(flag, -8);
          // Invisible hitbox for easier clicking
          const hitbox = new THREE.Mesh(
            new THREE.SphereGeometry(5, 16, 16),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
          );
          hitbox.userData = { markerId: obj.markerId, label: obj.label, type: "flag" };
          group.add(hitbox);
          flag.userData = hitbox.userData;
          group.add(flag);
          group.position.copy(markerVec);
          group.userData = hitbox.userData;
          return group;
        }

        if (obj.type === "pin" && pinModel) {
          const group = new THREE.Group();
          const pin = pinModel.clone(true);
          pin.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = false;
              child.material = child.material.clone();
              child.material.color.set(obj.color || "#b32c2c");
            }
          });
          const scale = NORMAL_PIN_SCALE;
          pin.scale.set(scale, scale, scale);
          const markerVec = latLngAltToVec3(obj.lat, obj.lng, obj.altitude);
          orientPin(pin, markerVec);
          positionPin(pin, -6);
          const hitbox = new THREE.Mesh(
            new THREE.SphereGeometry(3.2, 16, 16),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
          );
          hitbox.userData = { markerId: obj.markerId, label: obj.label, type: "pin" };
          const groupPos = new THREE.Group();
          groupPos.position.copy(markerVec);
          pin.userData = hitbox.userData;
          groupPos.add(pin);
          hitbox.position.set(0, 0, 0);
          groupPos.add(hitbox);
          groupPos.userData = hitbox.userData;
          return groupPos;
        }

        return new THREE.Object3D();
      };

      return {
        objectsData: entries,
        customPointObject: objectFactory,
        tocList: toc
      };
    }

    // USA / SD modes: standard pins with smaller scale
    const pinScale =
      mode === "usa" ? NORMAL_PIN_SCALE * 0.5 :
      mode === "sd"  ? NORMAL_PIN_SCALE * 0.25 :
      NORMAL_PIN_SCALE;

    const objectFactory = (obj) => {
      if (obj.type !== "pin") return new THREE.Object3D();
      const pinModel = getPinModel();
      if (!pinModel) return new THREE.Object3D();
      const group = new THREE.Group();
      const pin = pinModel.clone(true);
      pin.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.material = child.material.clone();
          child.material.color.set(obj.color || "#b32c2c");
        }
      });
      pin.scale.set(pinScale, pinScale, pinScale);
      const markerVec = latLngAltToVec3(obj.lat, obj.lng, obj.altitude);
      orientPin(pin, markerVec);
      positionPin(pin, -6);
      const hitbox = new THREE.Mesh(
        new THREE.SphereGeometry(3, 16, 16),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
      );
      hitbox.userData = { markerId: obj.markerId, label: obj.label, type: "pin" };
      const groupPos = new THREE.Group();
      groupPos.position.copy(markerVec);
      pin.userData = hitbox.userData;
      groupPos.add(pin);
      hitbox.position.set(0, 0, 0);
      groupPos.add(hitbox);
      groupPos.userData = hitbox.userData;
      return groupPos;
    };

    const entries = data.map((m, idx) => ({
      lat: m.lat,
      lng: m.lon,
      altitude: DOT_ALTITUDE,
      markerId: m.name,
      label: m.name,
      type: "pin",
      color: colorAssignments[idx]
    }));

    return {
      objectsData: entries,
      customPointObject: objectFactory,
      tocList: toc
    };
  }, [mode, data, colorAssignments, londonExpanded]);

  // Initial POV (on mode change)
  useEffect(() => {
    const pov = getInitialPOV(mode);
    const t = setTimeout(() => {
      if (globeEl.current && typeof globeEl.current.pointOfView === "function") {
        globeEl.current.pointOfView(pov, 1200);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [mode]);

  // Click handlers
  const handleObjectClick = (obj) => {
    if (!obj) return;
    // Flag toggles London expansion
    if (obj.type === "flag") {
      setLondonExpanded(true);
      setHovered(null);
      globeEl.current?.pointOfView({ lat: obj.lat, lng: obj.lng, altitude: 1.4 }, 1200);
      return;
    }
    // Pin: find marker by name and open
    const marker = data.find((m) => m.name === obj.markerId);
    if (marker) {
      onMarkerClick?.(marker);
      setHovered(null);
    }
  };

  const handleBackgroundClick = () => {
    if (londonExpanded) {
      setLondonExpanded(false);
      setHovered(null);
    }
  };

  const handleObjectHover = (obj) => {
    setHovered(obj || null);
  };

  // TOC actions
  function handleTOCClick(marker) {
    if (!marker) return;
    if (marker.clusterExpand) {
      setLondonExpanded(true);
      setHovered(null);
      globeEl.current?.pointOfView({ lat: marker.lat, lng: marker.lon, altitude: 1.4 }, 1200);
      return;
    }
    onMarkerClick?.(marker);
    setHovered(null);
  }

  // Wait for models before rendering custom pins
  if (!pinReady || !flagReady) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        Loading pins…
      </div>
    );
  }

  // Layout: globe left, TOC right
  return (
    <div
      className="isp-globe-section"
      style={{
        display: "flex",
        gap: 18,
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "8px 12px",
        background: "#fff"
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          width: 700,
          maxWidth: "95vw",
          height: 600,
          border: "1px solid #e9e7e0",
          borderRadius: 6,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 3px 14px rgba(0,0,0,0.10)"
        }}
      >
        <Globe
          ref={globeEl}
          globeImageUrl={globeImageUrl}
          // Supply custom three objects
          objectsData={objectsData}
          objectLat={(d) => d.lat}
          objectLng={(d) => d.lng}
          objectAltitude={(d) => d.altitude}
          objectThreeObject={customPointObject}
          // Events
          onObjectClick={handleObjectClick}
          onObjectHover={handleObjectHover}
          onBackgroundClick={handleBackgroundClick}
          // Atmosphere / BG
          atmosphereColor="rgba(0,0,0,0.08)"
          atmosphereAltitude={0.22}
          backgroundColor="rgba(0,0,0,0)"
        />
      </div>

      <nav
        style={{
          flex: "0 0 auto",
          width: 420,
          maxWidth: "95vw",
          background: "#fff",
          border: "1px solid #e9e7e0",
          borderRadius: 6,
          boxShadow: "0 3px 14px rgba(0,0,0,0.10)",
          padding: "12px 14px",
          maxHeight: 600,
          overflowY: "auto"
        }}
      >
        <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {tocList.map((item) => (
            <li key={item.idx} style={{ marginBottom: 10 }}>
              <button
                onClick={() => handleTOCClick(item.marker)}
                onMouseEnter={() =>
                  setHovered({ name: item.name, lat: item.marker.lat, lng: item.marker.lon, type: "pin" })
                }
                onMouseLeave={() => setHovered(null)}
                tabIndex={0}
                aria-label={`Jump to ${item.name}`}
                title={item.name}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  padding: "8px 6px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontFamily: "coolvetica, sans-serif",
                  letterSpacing: ".02em",
                  color: "#181818"
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>{item.roman}.</span>
                  <span style={{ flex: 1 }}>{item.name}</span>
                </div>
                {item.year && (
                  <div style={{ fontSize: 12, color: "#6c6c6a", marginTop: 2 }}>{item.year}</div>
                )}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}