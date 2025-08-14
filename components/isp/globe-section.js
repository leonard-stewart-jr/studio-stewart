import dynamic from "next/dynamic";
import { useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import {
  loadPinModel,
  orientPin,
  latLngAltToVec3,
  getPinModel,
  positionPin,
  bufferedBoundingGeometry,
  svgStringToTexture,
  getPinPalette,
  getPaletteAssignments,
  loadFlagModel,
  getFlagModel
} from "./modal/pin-utils";

// DATA FILES
import globeLocations from "../../data/globe-locations";
import usaLocations from "../../data/usa-locations";
import sdEvents from "../../data/sd-events";

// --- CONSTANTS AND CONFIGURATION ---
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const NORMAL_PIN_SCALE = 9 * 1.5;
const HITBOX_BUFFER = 1.07;
const DOT_ALTITUDE = 0.012;

// --- CLUSTER GROUP NAME (WORLD ONLY) ---
const LONDON_CLUSTER_GROUP = "london";

// --- MODE CONFIGS ---
const CAMERA_CONFIGS = {
  world: { lat: 20, lng: 0, altitude: 2.5 },
  usa:   { lat: 39.8283, lng: -98.5795, altitude: 1.2 },
  sd:    { lat: 44.5, lng: -100, altitude: 0.9 }
};
const GLOBE_IMAGES = {
  world: "/images/globe/world-hd.jpg",
  usa: "/images/globe/usa-hd.jpg",
  sd: "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
};
// --- UTILS ---
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

// Cluster helpers (WORLD ONLY)
function getLondonMarkers(allLocations) {
  return allLocations.filter((m) => m.clusterGroup === LONDON_CLUSTER_GROUP);
}
function getNonLondonMarkers(allLocations) {
  return allLocations.filter((m) => m.clusterGroup !== LONDON_CLUSTER_GROUP);
}
function getLondonClusterCenter(londonMarkers) {
  if (londonMarkers.length === 0) return { lat: 51.5, lng: -0.1 };
  const lat = londonMarkers.reduce((sum, m) => sum + m.lat, 0) / londonMarkers.length;
  const lng = londonMarkers.reduce((sum, m) => sum + m.lon, 0) / londonMarkers.length;
  return { lat, lng };
}

export default function GlobeSection({ onMarkerClick, mode = "world" }) {
  // --- DATA PICKER ---
  const data = mode === "world" ? globeLocations : mode === "usa" ? usaLocations : sdEvents;
  const palette = useMemo(() => getPinPalette(mode), [mode]);
  const globeImageUrl = GLOBE_IMAGES[mode];

  // --- STATE ---
  const globeEl = useRef();
  const globeContainerRef = useRef();
  const [hovered, setHovered] = useState(null);
  const [londonExpanded, setLondonExpanded] = useState(false); // Only for world
  const [pinReady, setPinReady] = useState(false);
  const [flagReady, setFlagReady] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);

  // Responsive
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 800);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let mounted = true;
    loadPinModel().then(() => {
      if (mounted) setPinReady(true);
    });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    let mounted = true;
    loadFlagModel().then(() => {
      if (mounted) setFlagReady(true);
    });
    return () => { mounted = false; };
  }, []);

  // --- COLOR ASSIGNMENTS ---
  const colorAssignments = useMemo(
    () => getPaletteAssignments(data.length, 42, palette),
    [data, palette]
  );

  // --- WORLD CLUSTER LOGIC ---
  const {
    objectsData,
    customPointObject,
    tocList
  } = useMemo(() => {
    if (mode === "world") {
      const londonMarkers = getLondonMarkers(data);
      const nonLondonMarkers = getNonLondonMarkers(data);

      const tocList = data.map((marker, idx) => {
        let year = "";
        if (marker.timeline && marker.timeline.length > 0 && marker.timeline[0].year)
          year = marker.timeline[0].year;
        return {
          idx,
          roman: toRoman(idx + 1),
          name: marker.name,
          marker,
          year,
          color: colorAssignments[idx]
        }
      });

      const pinModel = getPinModel();
      const flagModel = getFlagModel();

      // Map all pins, including "EXPAND"
      const objectsData = data.map((marker, idx) => {
        let isExpand = marker.clusterExpand === true;
        return {
          ...marker,
          lat: marker.lat,
          lng: marker.lon,
          markerId: marker.name,
          isStandardPin: !isExpand,
          isExpandPin: isExpand,
          idx,
          altitude: DOT_ALTITUDE,
          color: colorAssignments[idx],
          label: marker.name
        }
      });

      const customPointObject = (obj) => {
        // EXPAND pin: use flag, orient like a pin
        if (obj.isExpandPin && flagModel) {
          const group = new THREE.Group();
          const scale = NORMAL_PIN_SCALE;
          const markerVec = latLngAltToVec3(obj.lat, obj.lng, obj.altitude);
          const flag = flagModel.clone(true);

          flag.scale.set(scale, scale, scale);
          orientPin(flag, markerVec);
          positionPin(flag, -4);
          group.position.copy(markerVec);

          flag.userData = { markerId: obj.markerId, label: obj.label };
          group.add(flag);

          // Hitbox for interaction
          const width = 1.8, height = 3.5;
          const hitGeom = new THREE.BoxGeometry(width * HITBOX_BUFFER, height * HITBOX_BUFFER, 0.25);
          const hitMat = new THREE.MeshBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.01, depthWrite: false,
          });
          const hitBox = new THREE.Mesh(hitGeom, hitMat);
          hitBox.position.set(0, 0, 0.02);
          hitBox.userData = { markerId: obj.markerId, label: obj.label };
          hitBox.name = "expand-flag-hit";
          group.add(hitBox);

          group.userData = { markerId: obj.markerId, label: obj.label };
          group.name = "expand-flag-group";
          return group;
        }

        // Standard pins
        if (obj.isStandardPin && pinModel) {
          const group = new THREE.Group();
          const scale = NORMAL_PIN_SCALE;
          const pin = pinModel.clone(true);
          pin.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = false;
              child.material = child.material.clone();
              child.material.color.set(obj.color || "#b32c2c");
            }
          });
          pin.scale.set(scale, scale, scale);
          const markerVec = latLngAltToVec3(obj.lat, obj.lng, obj.altitude);
          group.position.copy(markerVec);
          orientPin(pin, markerVec);
          positionPin(pin, -4);
          pin.userData = { markerId: obj.markerId, label: obj.label };
          group.add(pin);

          // Buffered hitbox
          const hitGeom = bufferedBoundingGeometry(pin, HITBOX_BUFFER);
          const hitMat = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.01,
            depthWrite: false,
          });
          const hitBox = new THREE.Mesh(hitGeom, hitMat);
          hitBox.userData = { markerId: obj.markerId, label: obj.label };
          hitBox.name = "pin-hit-area";
          group.add(hitBox);

          group.userData = { markerId: obj.markerId, label: obj.label };
          return group;
        }
        return new THREE.Object3D();
      };

      return { objectsData, customPointObject, tocList };
    } else {
      // --- USA and SD modes: ---
      const tocList = data.map((marker, idx) => {
        let year = "";
        if (marker.timeline && marker.timeline.length > 0 && marker.timeline[0].year)
          year = marker.timeline[0].year;
        return {
          idx,
          roman: toRoman(idx + 1),
          name: marker.name,
          marker,
          year,
          color: colorAssignments[idx]
        }
      });
      const pinScale =
        mode === "usa"
          ? NORMAL_PIN_SCALE * 0.5
          : mode === "sd"
          ? NORMAL_PIN_SCALE * 0.25
          : NORMAL_PIN_SCALE;
      const objectsData = data.map((marker, idx) => ({
        ...marker,
        lat: marker.lat,
        lng: marker.lon,
        markerId: marker.name,
        isStandardPin: true,
        idx,
        altitude: DOT_ALTITUDE,
        color: colorAssignments[idx],
        label: marker.name,
        pinScale
      }));
      const customPointObject = (obj) => {
        const pinModel = getPinModel();
        if (obj.isStandardPin && pinModel) {
          const group = new THREE.Group();
          const scale = obj.pinScale || NORMAL_PIN_SCALE;
          const pin = pinModel.clone(true);
          pin.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = false;
              child.material = child.material.clone();
              child.material.color.set(obj.color || "#b32c2c");
            }
          });
          pin.scale.set(scale, scale, scale);
          const markerVec = latLngAltToVec3(obj.lat, obj.lng, obj.altitude);
          group.position.copy(markerVec);
          orientPin(pin, markerVec);
          positionPin(pin, -4);
          pin.userData = { markerId: obj.markerId, label: obj.label };
          group.add(pin);

          // Buffered hitbox
          const hitGeom = bufferedBoundingGeometry(pin, HITBOX_BUFFER);
          const hitMat = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.01,
            depthWrite: false,
          });
          const hitBox = new THREE.Mesh(hitGeom, hitMat);
          hitBox.userData = { markerId: obj.markerId, label: obj.label };
          hitBox.name = "pin-hit-area";
          group.add(hitBox);

          group.userData = { markerId: obj.markerId, label: obj.label };
          return group;
        }
        return new THREE.Object3D();
      };
      return { objectsData, customPointObject, tocList };
    }
  }, [mode, data, palette, colorAssignments, londonExpanded, pinReady, flagReady]);

  // --- GLOBE CAMERA: ZOOM TO MODE ---
  useEffect(() => {
    if (
      globeReady &&
      pinReady &&
      flagReady &&
      globeEl.current &&
      typeof globeEl.current.pointOfView === "function"
    ) {
      const cam = CAMERA_CONFIGS[mode] || CAMERA_CONFIGS.world;
      globeEl.current.pointOfView(cam, 1200);
    }
    setLondonExpanded(false);
  }, [mode, globeReady, pinReady, flagReady]);

  // --- GLOBE PIN/CLUSTER HANDLERS ---
  const handleObjectClick = (obj) => {
    if (obj && obj.isExpandPin) {
      setLondonExpanded(true);
      setHovered(null);
      return;
    } else if (mode === "world" && obj && getLondonMarkers(data).some(m => m.name === obj.markerId)) {
      // Only collapse cluster after selection if a London pin
      const marker = data.find((m) => m.name === obj.markerId);
      if (marker) {
        onMarkerClick(marker);
      }
      setLondonExpanded(false);
      setHovered(null);
    } else if (obj && obj.isStandardPin) {
      const marker = data.find((m) => m.name === obj.markerId);
      if (marker) {
        onMarkerClick(marker);
      }
      setLondonExpanded(false);
      setHovered(null);
    }
  };

  const handleObjectHover = (obj) => {
    setHovered(obj);
  };

  function handleTOCClick(marker) {
    if (marker.clusterExpand) {
      setLondonExpanded(true);
      setHovered(null);
      return;
    }
    onMarkerClick(marker);
    setLondonExpanded(false);
    setHovered(null);
  }

  // --- OVERLAY ---
  const showPinOverlay = hovered && (hovered.label || hovered.name);
  let overlayText = hovered?.label || hovered?.name;

  if (!pinReady || !flagReady) {
    return (
      <section
        className="isp-globe-section"
        style={{
          width: "100vw",
          minHeight: 500,
          height: 500,
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
        minHeight: "500px",
        height: "auto",
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
          width: 950,
          height: 700,
          maxWidth: 950,
          minWidth: 340,
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
          globeImageUrl={globeImageUrl}
          atmosphereColor="#e6dbb9"
          atmosphereAltitude={0.35}
          backgroundColor="rgba(0,0,0,0)"
          width={950}
          height={700}
          pointsData={[]} 
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="size"
          pointAltitude="altitude"
          pointLabel="label"
          onPointHover={handleObjectHover}
          onPointClick={onMarkerClick}
          objectsData={objectsData}
          objectLat="lat"
          objectLng="lng"
          objectAltitude={(obj) => obj.altitude || DOT_ALTITUDE}
          objectThreeObject={customPointObject}
          onObjectClick={handleObjectClick}
          onObjectHover={handleObjectHover}
          onGlobeReady={() => setGlobeReady(true)}
        />
        {showPinOverlay && (
          <div
            style={{
              position: "fixed",
              left: "50%",
              top: 80,
              zIndex: 9999,
              pointerEvents: "none",
              background: "rgba(0,0,0,0.91)",
              color: "#fff",
              borderRadius: 4,
              padding: "8px 18px",
              fontFamily: "coolvetica, sans-serif",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: ".03em",
              textTransform: "uppercase",
              opacity: 1,
              transition: "opacity 0.15s",
              transform: "translate(-50%, 0)",
              lineHeight: 1.17,
              textAlign: "center",
              userSelect: "none",
              boxShadow: "none",
              border: "none",
              whiteSpace: "nowrap",
            }}
          >
            {overlayText}
          </div>
        )}
      </div>
      <nav
        aria-label="Table of Contents"
        style={{
          marginLeft: isMobile ? 0 : 18,
          marginRight: 0,
          marginTop: isMobile ? 12 : 0,
          minWidth: "fit-content",
          maxWidth: isMobile ? "100%" : 315,
          width: "fit-content",
          display: "flex",
          flexDirection: "column",
          alignItems: isMobile ? "center" : "flex-start",
          justifyContent: isMobile ? "flex-start" : "center",
          background: "none",
          boxShadow: "none",
          position: "relative",
          zIndex: 100,
          left: isMobile ? 0 : 0,
        }}
      >
        <ol style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? 7 : 6,
          width: "100%",
        }}>
          {tocList.map((item, idx) => (
            <li key={item.name} style={{ width: "100%", marginBottom: 0 }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: item.color,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "coolvetica-condensed, coolvetica, 'Open Sans', Arial, sans-serif",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "1.5px 0 1.5px 0",
                  borderRadius: 4,
                  width: "fit-content",
                  textAlign: "left",
                  lineHeight: 1.17,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  transition: "color 0.14s",
                  marginLeft: 0,
                }}
                onClick={() => handleTOCClick(item.marker)}
                onMouseEnter={() => setHovered({ name: item.name, year: item.year, idx, label: item.name, markerId: item.marker.markerId })}
                onMouseLeave={() => setHovered(null)}
                tabIndex={0}
                aria-label={`Jump to ${item.name}`}
                title={item.name}
              >
                <span style={{
                  fontFamily: "coolvetica-condensed, coolvetica, 'Open Sans', Arial, sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  minWidth: 18,
                  letterSpacing: ".03em",
                  marginRight: 2,
                  color: item.color,
                  opacity: 0.93,
                  flexShrink: 0,
                }}>{item.roman}.</span>
                <span style={{
                  flex: 1,
                  fontFamily: "coolvetica-condensed, coolvetica, 'Open Sans', Arial, sans-serif",
                  fontWeight: 600,
                  fontSize: 16,
                  letterSpacing: ".06em",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  marginRight: 0,
                  marginBottom: 0,
                }}>
                  {item.name}
                </span>
              </button>
              {item.year && (
                <div
                  style={{
                    fontFamily: "coolvetica-condensed, coolvetica, 'Open Sans', Arial, sans-serif",
                    fontWeight: 400,
                    fontSize: 12,
                    color: "#b1b1ae",
                    letterSpacing: ".03em",
                    marginLeft: 27,
                    lineHeight: 1.18,
                    marginTop: 0,
                    marginBottom: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textTransform: "none",
                    maxWidth: 235,
                  }}
                >
                  {item.year}
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}
