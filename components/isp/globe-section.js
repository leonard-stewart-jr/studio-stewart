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

// --- DYNAMIC GLOBE ---
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const NORMAL_PIN_SCALE = 9 * 1.5;
const DOT_ALTITUDE = 0.012;
const LONDON_CLUSTER_GROUP = "london";

const CAMERA_CONFIGS = {
  world: { lat: 20, lng: 0, altitude: 0.12 },
  usa:   { lat: 39.8283, lng: -98.5795, altitude: 0.22 }, // tighter zoom
  sd:    { lat: 44.5, lng: -100, altitude: 0.11 } // SD zoom
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
  // Data, palette, and configs for each mode
  const [pinReady, setPinReady] = useState(false);
  const [flagReady, setFlagReady] = useState(false);
  const [londonExpanded, setLondonExpanded] = useState(false);
  const [hovered, setHovered] = useState(null);

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
    loadFlagModel().then(() => { if (mounted) setFlagReady(true); });
    return () => { mounted = false; };
  }, []);

  // Common pin color logic (for all modes)
  function getColorAssignments(data, palette, mode) {
    const arr = getPaletteAssignments(data.length, 42, palette);
    if (mode === "world" && arr.length > 0) {
      arr[0] = "#8f6c5c"; // darker, readable terracotta brown
    }
    return arr;
  }

  // --- WORLD GLOBE ---
  const worldPalette = useMemo(() => getPinPalette("world"), []);
  const worldColorAssignments = useMemo(() => getColorAssignments(globeLocations, worldPalette, "world"), [worldPalette]);
  const { worldObjectsData, worldCustomPointObject, worldTocList } = useMemo(() => {
    const data = globeLocations;
    const palette = worldPalette;
    const colorAssignments = worldColorAssignments;
    const londonMarkers = getLondonMarkers(data);
    const nonLondonMarkers = getNonLondonMarkers(data);
    // Find the London cluster center (the expand marker)
    const clusterExpandMarker = data.find(m => m.clusterExpand);
    const clusterLat = clusterExpandMarker ? clusterExpandMarker.lat : 51.512;
    const clusterLon = clusterExpandMarker ? clusterExpandMarker.lon : -0.097;
    let entries = [];
    if (!londonExpanded) {
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
      if (obj.isExpandPin) {
        if (flagModel) {
          const group = new THREE.Group();
          const scale = NORMAL_PIN_SCALE * 1.09 * 0.5;
          const markerVec = latLngAltToVec3(obj.lat, obj.lng, obj.altitude);
          const flag = flagModel.clone(true);
          flag.scale.set(scale, scale, scale);
          orientPin(flag, markerVec);
          flag.rotateZ(Math.PI / 4);
          positionPin(flag, -8);
          group.position.copy(markerVec);
          flag.userData = { markerId: obj.markerId, label: obj.label };
          group.add(flag);
          group.userData = { markerId: obj.markerId, label: obj.label };
          group.name = "expand-flag-group";
          return group;
        }
        return new THREE.Object3D();
      }
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

    return { worldObjectsData: objectsData, worldCustomPointObject: customPointObject, worldTocList: tocList };
  }, [londonExpanded, pinReady, flagReady, worldPalette, worldColorAssignments]);

  // --- USA GLOBE ---
  const usaPalette = useMemo(() => getPinPalette("usa"), []);
  const usaColorAssignments = useMemo(() => getColorAssignments(usaLocations, usaPalette, "usa"), [usaPalette]);
  const { usaObjectsData, usaCustomPointObject, usaTocList } = useMemo(() => {
    const data = usaLocations;
    const palette = usaPalette;
    const colorAssignments = usaColorAssignments;
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
    const pinScale = NORMAL_PIN_SCALE * 0.5;
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
    return { usaObjectsData: objectsData, usaCustomPointObject: customPointObject, usaTocList: tocList };
  }, [usaPalette, usaColorAssignments, pinReady]);

  // --- SD GLOBE ---
  const sdPalette = useMemo(() => getPinPalette("sd"), []);
  const sdColorAssignments = useMemo(() => getColorAssignments(sdEvents, sdPalette, "sd"), [sdPalette]);
  const { sdObjectsData, sdCustomPointObject, sdTocList } = useMemo(() => {
    const data = sdEvents;
    const palette = sdPalette;
    const colorAssignments = sdColorAssignments;
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
    const pinScale = NORMAL_PIN_SCALE * 0.25;
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
    return { sdObjectsData: objectsData, sdCustomPointObject: customPointObject, sdTocList: tocList };
  }, [sdPalette, sdColorAssignments, pinReady]);

  // Globe refs for each globe
  const worldGlobeRef = useRef();
  const usaGlobeRef = useRef();
  const sdGlobeRef = useRef();

  // Only run camera and orientation ONCE per globe mount
  useEffect(() => {
    // World - no special rotation
    if (mode === "world" && worldGlobeRef.current && typeof worldGlobeRef.current.pointOfView === "function") {
      worldGlobeRef.current.pointOfView(CAMERA_CONFIGS.world, 0);
    }
    // USA - zoom and rotate 70deg
    if (mode === "usa" && usaGlobeRef.current && typeof usaGlobeRef.current.pointOfView === "function") {
      usaGlobeRef.current.pointOfView(CAMERA_CONFIGS.usa, 0);
      setTimeout(() => {
        if (usaGlobeRef.current && usaGlobeRef.current.controls) {
          usaGlobeRef.current.controls().rotateLeft(70 * Math.PI / 180);
        }
      }, 100);
    }
    // SD - zoom and rotate 70deg
    if (mode === "sd" && sdGlobeRef.current && typeof sdGlobeRef.current.pointOfView === "function") {
      sdGlobeRef.current.pointOfView(CAMERA_CONFIGS.sd, 0);
      setTimeout(() => {
        if (sdGlobeRef.current && sdGlobeRef.current.controls) {
          sdGlobeRef.current.controls().rotateLeft(70 * Math.PI / 180);
        }
      }, 100);
    }
    setLondonExpanded(false);
  }, [mode, pinReady, flagReady]);

  // TOC click logic
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

  // Loading
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

  // --- RENDER ---
  let objectsData, customPointObject, tocList, globeImageUrl, globeRef;
  if (mode === "world") {
    objectsData = worldObjectsData;
    customPointObject = worldCustomPointObject;
    tocList = worldTocList;
    globeImageUrl = GLOBE_IMAGES.world;
    globeRef = worldGlobeRef;
  } else if (mode === "usa") {
    objectsData = usaObjectsData;
    customPointObject = usaCustomPointObject;
    tocList = usaTocList;
    globeImageUrl = GLOBE_IMAGES.usa;
    globeRef = usaGlobeRef;
  } else if (mode === "sd") {
    objectsData = sdObjectsData;
    customPointObject = sdCustomPointObject;
    tocList = sdTocList;
    globeImageUrl = GLOBE_IMAGES.sd;
    globeRef = sdGlobeRef;
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
        {/* Only show the active globe */}
        <div style={{ display: mode === "world" ? "block" : "none", width: "100%", height: "100%" }}>
          <Globe
            ref={worldGlobeRef}
            globeImageUrl={GLOBE_IMAGES.world}
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
            objectsData={worldObjectsData}
            objectLat="lat"
            objectLng="lng"
            objectAltitude={(obj) => obj.altitude || DOT_ALTITUDE}
            objectThreeObject={worldCustomPointObject}
            onObjectClick={(obj) => {
              if (obj && obj.isExpandPin) {
                setLondonExpanded(true);
                setHovered(null);
                return;
              }
              if (obj && obj.isStandardPin) {
                const marker = globeLocations.find((m) => m.name === obj.markerId);
                if (marker) onMarkerClick(marker);
                setLondonExpanded(false);
                setHovered(null);
              }
            }}
            onObjectHover={setHovered}
          />
        </div>
        <div style={{ display: mode === "usa" ? "block" : "none", width: "100%", height: "100%" }}>
          <Globe
            ref={usaGlobeRef}
            globeImageUrl={GLOBE_IMAGES.usa}
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
            objectsData={usaObjectsData}
            objectLat="lat"
            objectLng="lng"
            objectAltitude={(obj) => obj.altitude || DOT_ALTITUDE}
            objectThreeObject={usaCustomPointObject}
            onObjectClick={(obj) => {
              if (obj && obj.isStandardPin) {
                const marker = usaLocations.find((m) => m.name === obj.markerId);
                if (marker) onMarkerClick(marker);
                setHovered(null);
              }
            }}
            onObjectHover={setHovered}
          />
        </div>
        <div style={{ display: mode === "sd" ? "block" : "none", width: "100%", height: "100%" }}>
          <Globe
            ref={sdGlobeRef}
            globeImageUrl={GLOBE_IMAGES.sd}
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
            objectsData={sdObjectsData}
            objectLat="lat"
            objectLng="lng"
            objectAltitude={(obj) => obj.altitude || DOT_ALTITUDE}
            objectThreeObject={sdCustomPointObject}
            onObjectClick={(obj) => {
              if (obj && obj.isStandardPin) {
                const marker = sdEvents.find((m) => m.name === obj.markerId);
                if (marker) onMarkerClick(marker);
                setHovered(null);
              }
            }}
            onObjectHover={setHovered}
          />
        </div>
      </div>
      {/* TOC styled to match navbar */}
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
          {(tocList || []).map((item, idx) => (
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
