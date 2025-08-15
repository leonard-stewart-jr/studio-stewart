import dynamic from "next/dynamic";
import { useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import {
  loadPinModel,
  orientPin,
  latLngAltToVec3,
  getPinModel,
  positionPin,
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
const DOT_ALTITUDE = 0.012;
const LONDON_CLUSTER_GROUP = "london";

const CAMERA_CONFIGS = {
  world: { lat: 20, lng: 0, altitude: 0.1 },
  usa:   { lat: 39.8283, lng: -98.5795, altitude: 0.6 },
  sd:    { lat: 44.5, lng: -100, altitude: 0.2 }
};
const GLOBE_IMAGES = {
  world: "/images/globe/world-hd.jpg",
  usa: "/images/globe/usa-hd.jpg",
  sd: "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
};

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

function getLondonMarkers(allLocations) {
  return allLocations.filter((m) => m.clusterGroup === LONDON_CLUSTER_GROUP);
}
function getNonLondonMarkers(allLocations) {
  return allLocations.filter((m) => m.clusterGroup !== LONDON_CLUSTER_GROUP && !m.clusterExpand);
}

export default function GlobeSection({ onMarkerClick, mode = "world" }) {
  const data = mode === "world" ? globeLocations : mode === "usa" ? usaLocations : sdEvents;
  const palette = useMemo(() => getPinPalette(mode), [mode]);
  const globeImageUrl = GLOBE_IMAGES[mode];

  const globeEl = useRef();
  const [hovered, setHovered] = useState(null);
  const [londonExpanded, setLondonExpanded] = useState(false);
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
    loadPinModel().then(() => { if (mounted) setPinReady(true); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    let mounted = true;
    loadFlagModel().then(() => { if (mounted) setFlagReady(true); });
    return () => { mounted = false; };
  }, []);

  // Pin colors: darken Mesopotamia
  const colorAssignments = useMemo(() => {
    const arr = getPaletteAssignments(data.length, 42, palette);
    if (mode === "world" && arr.length > 0) {
      arr[0] = "#8f6c5c"; // darker, readable terracotta brown
    }
    return arr;
  }, [data, palette, mode]);

  // --- Cluster logic ---
  const { objectsData, customPointObject, tocList } = useMemo(() => {
    if (mode === "world") {
      const londonMarkers = getLondonMarkers(data);
      const nonLondonMarkers = getNonLondonMarkers(data);

      // Find the London cluster center (the expand marker)
      const clusterExpandMarker = data.find(m => m.clusterExpand);
      const clusterLat = clusterExpandMarker ? clusterExpandMarker.lat : 51.512;
      const clusterLon = clusterExpandMarker ? clusterExpandMarker.lon : -0.097;

      let entries = [];
      if (!londonExpanded) {
        // Cluster mode: only nonLondonMarkers and the expand marker (flag)
        entries = [
          ...nonLondonMarkers.map(marker => ({
            ...marker,
            idx: data.indexOf(marker),
            isStandardPin: true
          })),
          ...data.filter(m => m.clusterExpand).map(marker => ({
            ...marker,
            idx: data.indexOf(marker),
            isExpandPin: true
          }))
        ];
      } else {
        // Expanded mode: show all nonLondonMarkers and all London markers as pins (spread out London pins)
        const N = londonMarkers.length;
        const radius = 1.2; // degrees, tweak for spread
        entries = [
          ...nonLondonMarkers.map(marker => ({
            ...marker,
            idx: data.indexOf(marker),
            isStandardPin: true
          })),
          ...londonMarkers.map((marker, i) => {
            // Spread in a circle
            const angle = (2 * Math.PI * i) / N;
            const lat = clusterLat + radius * Math.cos(angle);
            const lon = clusterLon + radius * Math.sin(angle);
            return {
              ...marker,
              idx: data.indexOf(marker),
              isStandardPin: true,
              isLondon: true,
              lat, // Overwrite lat/lon to spread
              lon
            };
          })
        ];
      }

      // TOC: Remove expand marker (clusterExpand)
      const tocList = data
        .map((marker, idx) => {
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
        })
        .filter(item => !item.marker.clusterExpand);

      const pinModel = getPinModel();
      const flagModel = getFlagModel();

      const objectsData = entries.map(obj => {
        if (obj.isExpandPin) {
          // Only the flag, never a pin
          return {
            ...obj,
            lat: obj.lat,
            lng: obj.lon,
            markerId: obj.name,
            isExpandPin: true,
            altitude: DOT_ALTITUDE,
            color: colorAssignments[obj.idx],
            label: obj.name
          };
        }
        // Only standard pins get isStandardPin
        return {
          ...obj,
          lat: obj.lat,
          lng: obj.lon,
          markerId: obj.name,
          isStandardPin: true,
          isLondon: !!obj.isLondon,
          altitude: DOT_ALTITUDE,
          color: colorAssignments[obj.idx],
          label: obj.name
        };
      });

      const customPointObject = (obj) => {
        // Only render flag for expand pin, never a pin
        if (obj.isExpandPin) {
          if (flagModel) {
            const group = new THREE.Group();
            const scale = NORMAL_PIN_SCALE * 1.09 * 0.5;
            const markerVec = latLngAltToVec3(obj.lat, obj.lng, obj.altitude);

            const flag = flagModel.clone(true);
            flag.scale.set(scale, scale, scale);

            // Orient the flag so that its "banner" is upright on the globe
            orientPin(flag, markerVec);
            flag.rotateZ(Math.PI / 2);
            flag.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
            positionPin(flag, -8);

            group.position.copy(markerVec);
            flag.userData = { markerId: obj.markerId, label: obj.label };
            group.add(flag);
            group.userData = { markerId: obj.markerId, label: obj.label };
            group.name = "expand-flag-group";
            return group;
          }
          // Flag not ready: do NOT render anything
          return new THREE.Object3D();
        }
        // Standard pins only
        if (obj.isStandardPin && pinModel) {
          const group = new THREE.Group();
          let scale = NORMAL_PIN_SCALE;
          if (obj.isLondon) {
            scale = NORMAL_PIN_SCALE * 0.75;
          }
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
          positionPin(pin, -6);
          pin.userData = { markerId: obj.markerId, label: obj.label };
          group.add(pin);
          group.userData = { markerId: obj.markerId, label: obj.label };
          return group;
        }
        return new THREE.Object3D();
      };

      return { objectsData, customPointObject, tocList };
    } else {
      // USA/SD
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
          positionPin(pin, -6);
          pin.userData = { markerId: obj.markerId, label: obj.label };
          group.add(pin);
          group.userData = { markerId: obj.markerId, label: obj.label };
          return group;
        }
        return new THREE.Object3D();
      };
      return { objectsData, customPointObject, tocList };
    }
  }, [mode, data, palette, colorAssignments, londonExpanded, pinReady, flagReady]);

  // Camera to mode
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

  const handleObjectClick = (obj) => {
    if (obj && obj.isExpandPin) {
      setLondonExpanded(true);
      setHovered(null);
      return;
    } else if (mode === "world" && obj && getLondonMarkers(data).some(m => m.name === obj.markerId)) {
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
    } else if (londonExpanded) {
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
        style={{
          flex: "0 1 auto",
          width: 1050,
          height: 845,
          maxWidth: 1050,
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
          atmosphereAltitude={0.22}
          backgroundColor="rgba(0,0,0,0)"
          width={2000}
          height={1050}
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
      </div>
      {/* TOC styled to match navbar - now with year below title, perfectly left aligned, and more vertical space */}
      <nav
        aria-label="Table of Contents"
        style={{
          marginLeft: isMobile ? 0 : 38,
          marginRight: 0,
          marginTop: isMobile ? 12 : 0,
          minWidth: "fit-content",
          maxWidth: isMobile ? "100%" : 540,
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
          fontFamily: "coolvetica, sans-serif"
        }}
      >
        <ol style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? 15.5 : 14,
          width: "100%",
        }}>
          {tocList.map((item, idx) => (
            <li key={item.name} style={{
              width: "100%",
              marginBottom: 0,
              padding: "0 0 0 0",
              display: "flex",
              alignItems: "flex-start"
            }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: item.color,
                  fontWeight: 400,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "coolvetica, sans-serif",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "0px 0px",
                  borderRadius: 0,
                  width: "100%",
                  minHeight: 32,
                  boxShadow: "none",
                  lineHeight: 1.18,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  overflow: "hidden",
                  whiteSpace: "normal",
                  textOverflow: "ellipsis",
                  transition: "color 0.12s, background 0.12s",
                  marginLeft: 0,
                  justifyContent: "flex-start",
                  textAlign: "left"
                }}
                onClick={() => handleTOCClick(item.marker)}
                onMouseEnter={() => setHovered({ ...item.marker, idx, label: item.name, markerId: item.marker.markerId })}
                onMouseLeave={() => setHovered(null)}
                tabIndex={0}
                aria-label={`Jump to ${item.name}`}
                title={item.name}
              >
                {/* Roman numeral: min width so titles always align */}
                <span style={{
                  fontFamily: "coolvetica, sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  minWidth: 26,
                  letterSpacing: "0.5px",
                  color: item.color,
                  opacity: 0.93,
                  flexShrink: 0,
                  marginRight: 6,
                  display: "inline-block",
                  textAlign: "left"
                }}>{item.roman}.</span>
                {/* Title + year column */}
                <span style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  textAlign: "left",
                  minWidth: 0
                }}>
                  <span style={{
                    fontWeight: 400,
                    fontSize: 14,
                    letterSpacing: "0.5px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    fontFamily: "coolvetica, sans-serif"
                  }}>
                    {item.name}
                  </span>
                  {item.year && (
                    <span style={{
                      marginTop: 2,
                      fontSize: 13,
                      color: "#b1b1ae",
                      fontWeight: 400,
                      letterSpacing: "0.5px",
                      fontFamily: "coolvetica, sans-serif",
                      opacity: 0.95,
                      textAlign: "left"
                    }}>
                      {item.year}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}
