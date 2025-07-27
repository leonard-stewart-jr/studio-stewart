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
  getPaletteAssignments
} from "./modal/pin-utils";

// DATA FILES
import globeLocations from "../../data/globe-locations";
import usaLocations from "../../data/usa-locations";
import sdEvents from "../../data/sd-events";

// --- CONSTANTS AND CONFIGURATION ---
const LONDON_EXPAND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><polyline points="160 48 208 48 208 96" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="152" y1="104" x2="208" y2="48" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="96 208 48 208 48 160" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="104" y1="152" x2="48" y2="208" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="208 160 208 208 160 208" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="152" y1="152" x2="208" y2="208" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="48 96 48 48 96 48" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="104" y1="104" x2="48" y2="48" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>`;

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const NORMAL_PIN_SCALE = 9 * 1.5;
const HITBOX_BUFFER = 1.07;
const CLUSTER_DOT_SIZE = 0.7 * 2.2;
const DOT_ALTITUDE = 0.012;
const DOT_COLOR = "#b32c2c"; // Used for cluster lines and dots

// --- CLUSTER GROUP NAME (WORLD ONLY) ---
const LONDON_CLUSTER_GROUP = "london";

// --- MODE CONFIGS ---
const CAMERA_CONFIGS = {
  world: { lat: 20, lng: 0, altitude: 2.5 },
  usa:   { lat: 39.8283, lng: -98.5795, altitude: 1.2 },
  sd:    { lat: 44.5, lng: -100, altitude: 0.9 }
};
const GLOBE_IMAGES = {
  world: "/images/globe/world-hd.jpg", // <-- Your world map image
  usa: "/images/globe/usa-hd.jpg",     // <-- Your USA outline 
  sd: "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
  // Swap in your higher-res or SD-outlined globe images as needed
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
function getComparisonMarkerIdx(nonLondonMarkers) {
  const idx = nonLondonMarkers.findIndex(m =>
    m.name.toLowerCase().includes("eastern state") || m.name.toLowerCase().includes("united states")
  );
  return idx !== -1 ? idx : 0;
}

// SVG TEXTURE CACHE FOR CLUSTER
function useExpandSvgTexture() {
  const [expandSvgTex, setExpandSvgTex] = useState(null);
  useEffect(() => {
    let mounted = true;
    svgStringToTexture(LONDON_EXPAND_SVG, 256).then((tex) => {
      if (mounted) setExpandSvgTex(tex);
    });
    return () => { mounted = false; };
  }, []);
  return expandSvgTex;
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

  const expandSvgTex = useExpandSvgTexture();

  // --- COLOR ASSIGNMENTS ---
  const colorAssignments = useMemo(
    () => getPaletteAssignments(data.length, 42, palette),
    [data, palette]
  );

  // --- MARKER, TOC, ETC. ---
  const [markerScreenPositions, setMarkerScreenPositions] = useState([]);
  const tocRefs = useRef([]);
  const [tocScreenPositions, setTocScreenPositions] = useState([]);
  const [svgDims, setSvgDims] = useState({ width: 0, height: 0 });

  // --- WORLD CLUSTER LOGIC ---
  // Only defined/used for "world" mode
  const {
    objectsData,
    linesData,
    customPointObject,
    customLineObject,
    tocList,
    comparisonMarkerIdx
  } = useMemo(() => {
    if (mode === "world") {
      const londonMarkers = getLondonMarkers(data);
      const nonLondonMarkers = getNonLondonMarkers(data);
      const londonCenter = getLondonClusterCenter(londonMarkers);

      // --- CUSTOM COORDINATE for LONDON CLUSTER BUTTON ---
      const customClusterCoords = { lat: 53.236866, lng: -4.292616 };

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

      const comparisonMarkerIdx = getComparisonMarkerIdx(nonLondonMarkers);

      let objectsData = [];
      let linesData = [];
      let customPointObject = undefined;
      let customLineObject = undefined;

      const pinModel = getPinModel();

      if (!londonExpanded) {
        objectsData = [
          {
            ...customClusterCoords,
            markerId: "london-cluster",
            isLondonCluster: true,
            altitude: DOT_ALTITUDE,
            label: "EXPAND"
          },
          ...nonLondonMarkers.map((m, idx) => {
            const globalIdx = data.findIndex(mm => mm.name === m.name);
            return {
              ...m,
              lat: m.lat,
              lng: m.lon,
              markerId: m.name,
              isStandardPin: true,
              showDotAndPin: idx === comparisonMarkerIdx,
              idx,
              altitude: DOT_ALTITUDE,
              color: colorAssignments[globalIdx],
              label: m.name
            }
          }),
        ];

        customPointObject = (obj) => {
if (obj.isLondonCluster) {
  const group = new THREE.Group();
  // Tall white rectangle: width=0.13, height=0.26, depth=0.13
  const width = 0.13;
  const height = 0.26;
  const depth = 0.13;
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff, // White
    transparent: false,
    opacity: 1,
    depthTest: false,
  });
  const rect = new THREE.Mesh(geometry, material);
  rect.position.set(0, 0, 0);
  rect.renderOrder = 10;
  rect.name = "london-expand-rect";
  group.add(rect);

  // Hit area (make it easier to click)
  const hitGeom = new THREE.BoxGeometry(width * HITBOX_BUFFER, height * HITBOX_BUFFER, depth * HITBOX_BUFFER);
  const hitMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.01,
    depthWrite: false,
  });
  const hitBox = new THREE.Mesh(hitGeom, hitMat);
  hitBox.position.set(0, 0, 0.02);
  hitBox.userData = { markerId: "london-cluster", label: "EXPAND" };
  hitBox.name = "london-cluster-hit";
  group.add(hitBox);

  group.userData = { markerId: "london-cluster", label: "EXPAND" };
  group.name = "london-cluster-group";
  return group;
}

          // ALL OTHER PINS: use pin-utils helpers for hitbox etc.
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

            // Buffered hitbox (using helper)
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

          // Fix for react-globe.gl: always return Object3D
          return new THREE.Object3D();
        };
      } else {
        // LONDON EXPANDED LOGIC (pins inside cluster = half of big size)
        const N = londonMarkers.length;
        const wheelRadius = 1.5;
        const pinScale = NORMAL_PIN_SCALE * 0.5;

        objectsData = londonMarkers.map((marker, idx) => {
          const angle = (2 * Math.PI * idx) / N;
          const lat = londonCenter.lat + wheelRadius * Math.cos(angle);
          const lng = londonCenter.lng + wheelRadius * Math.sin(angle);
          const globalIdx = data.findIndex(m => m.name === marker.name);
          return {
            ...marker,
            lat,
            lng,
            markerId: marker.name,
            isLondonWheel: true,
            actualLat: marker.lat,
            actualLng: marker.lon,
            label: marker.name,
            isStandardPin: true,
            altitude: 0,
            pinScale,
            color: colorAssignments[globalIdx]
          };
        });

        linesData = objectsData.map((obj) => ({
          start: {
            lat: londonCenter.lat,
            lng: londonCenter.lng,
            alt: 0.018,
          },
          end: {
            lat: obj.actualLat,
            lng: obj.actualLng,
            alt: DOT_ALTITUDE,
          },
          markerId: obj.markerId,
        }));

        customPointObject = (obj) => {
          if (obj.isStandardPin && pinModel) {
            const group = new THREE.Group();
            const scale = obj.pinScale ?? 7;
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
            positionPin(pin, 0);
            pin.userData = { markerId: obj.markerId };
            group.add(pin);

            // Buffered hitbox (using helper)
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

        customLineObject = (lineObj) => {
          const start = latLngAltToVec3(
            lineObj.start.lat,
            lineObj.start.lng,
            lineObj.start.alt
          );
          const end = latLngAltToVec3(
            lineObj.end.lat,
            lineObj.end.lng,
            lineObj.end.alt
          );
          const points = [start, end];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineDashedMaterial({
            color: DOT_COLOR,
            opacity: 0.53,
            linewidth: 1,
            transparent: true,
            dashSize: 0.08,
            gapSize: 0.065,
          });
          const line = new THREE.Line(geometry, material);
          line.computeLineDistances();
          line.renderOrder = 0;
          return line;
        };
      }
      return { objectsData, linesData, customPointObject, customLineObject, tocList, comparisonMarkerIdx };
    } else {
      // --- USA and SD modes: NO cluster logic ---
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
      const objectsData = data.map((marker, idx) => ({
        ...marker,
        lat: marker.lat,
        lng: marker.lon,
        markerId: marker.name,
        isStandardPin: true,
        idx,
        altitude: DOT_ALTITUDE,
        color: colorAssignments[idx],
        label: marker.name
      }));
      const customPointObject = (obj) => {
        const pinModel = getPinModel();
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

          // Buffered hitbox (using helper)
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
      return { objectsData, linesData: [], customPointObject, customLineObject: undefined, tocList, comparisonMarkerIdx: 0 };
    }
  }, [mode, data, palette, colorAssignments, expandSvgTex, londonExpanded, pinReady]);

  // --- GLOBE CAMERA: ZOOM TO MODE ---
  useEffect(() => {
    if (globeEl.current && typeof globeEl.current.pointOfView === "function") {
      const cam = CAMERA_CONFIGS[mode] || CAMERA_CONFIGS.world;
      globeEl.current.pointOfView(cam, 1200);
    }
    setLondonExpanded(false); // Reset cluster state on mode switch
  }, [mode]);

  // --- MARKER SCREEN POSITIONS (for SVG lines, overlays) ---
  useEffect(() => {
    function updateMarkerPositions() {
      if (
        !globeEl.current ||
        typeof globeEl.current.getScreenCoords !== "function" ||
        !globeContainerRef.current
      )
        return;
      const globeRect = globeContainerRef.current.getBoundingClientRect();
      const positions = data.map((marker) => {
        const { lat, lon } = marker;
        const coords = globeEl.current.getScreenCoords(lat, lon);
        return {
          x: globeRect.left + coords.x,
          y: globeRect.top + coords.y,
        };
      });
      setMarkerScreenPositions(positions);
      setSvgDims({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    updateMarkerPositions();
    window.addEventListener("resize", updateMarkerPositions);
    let animationFrame;
    function pollCamera() {
      updateMarkerPositions();
      animationFrame = requestAnimationFrame(pollCamera);
    }
    animationFrame = requestAnimationFrame(pollCamera);

    return () => {
      window.removeEventListener("resize", updateMarkerPositions);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [data]);

  useEffect(() => {
    function updateTocPositions() {
      const positions = tocRefs.current.map(ref => {
        if (!ref) return null;
        const rect = ref.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      });
      setTocScreenPositions(positions);
    }
    updateTocPositions();
    window.addEventListener("resize", updateTocPositions);
    return () => window.removeEventListener("resize", updateTocPositions);
  }, [tocList.length]);

  // --- CLUSTER COLLAPSE HANDLER (WORLD ONLY) ---
  useEffect(() => {
    if (!londonExpanded || mode !== "world") return;

    function handleWindowClick(e) {
      setLondonExpanded(false);
      setHovered(null);
    }
    window.addEventListener("mousedown", handleWindowClick, true);
    return () => window.removeEventListener("mousedown", handleWindowClick, true);
  }, [londonExpanded, mode]);

  // --- GLOBE PIN/CLUSTER HANDLERS ---
  const handleObjectClick = (obj) => {
    if (mode === "world" && obj && obj.markerId === "london-cluster") {
      setLondonExpanded(true);
      setHovered(null);
    } else if (mode === "world" && obj && obj.isLondonWheel) {
      const marker = getLondonMarkers(data).find((m) => m.name === obj.markerId);
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
    onMarkerClick(marker);
    setLondonExpanded(false);
    setHovered(null);
  }

  // --- OVERLAY ---
  const showPinOverlay = hovered && (hovered.label || hovered.name) && markerScreenPositions && markerScreenPositions.length > 0;
  let overlayText = hovered?.label || hovered?.name;
  if (mode === "world" && hovered && hovered.markerId === "london-cluster") overlayText = "EXPAND";

  // Arrows SVG for overlay (for cluster)
  const arrowsSvg = (
    <svg width="36" height="36" viewBox="0 0 36 36" style={{ display: "block" }}>
      <g stroke="#b32c2c" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <line x1="6" y1="16" x2="6" y2="6" />
        <line x1="6" y1="6" x2="16" y2="6" />
        <line x1="20" y1="6" x2="30" y2="6" />
        <line x1="30" y1="6" x2="30" y2="16" />
        <line x1="6" y1="20" x2="6" y2="30" />
        <line x1="6" y1="30" x2="16" y2="30" />
        <line x1="20" y1="30" x2="30" y2="30" />
        <line x1="30" y1="30" x2="30" y2="20" />
      </g>
    </svg>
  );
  let overlayPos = null;
  if (
    hovered &&
    mode === "world" &&
    hovered.markerId === "london-cluster" &&
    markerScreenPositions.length > 0
  ) {
    overlayPos = markerScreenPositions[0];
  } else if (
    hovered &&
    typeof hovered.idx === "number" &&
    markerScreenPositions[hovered.idx]
  ) {
    overlayPos = {
      x: markerScreenPositions[hovered.idx].x,
      y: markerScreenPositions[hovered.idx].y + 18,
    };
  }

  if (!pinReady) {
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
          linesData={linesData && linesData.length > 0 ? linesData : []}
          lineStartLat={(l) => l.start.lat}
          lineStartLng={(l) => l.start.lng}
          lineStartAltitude={(l) => l.start.alt}
          lineEndLat={(l) => l.end.lat}
          lineEndLng={(l) => l.end.lng}
          lineEndAltitude={(l) => l.end.alt}
          lineThreeObject={linesData && linesData.length > 0 ? customLineObject : undefined}
        />
        {showPinOverlay && overlayPos && (
          <div
            style={{
              position: "fixed",
              left: overlayPos.x ?? 0,
              top: overlayPos.y ?? 0,
              zIndex: 9999,
              pointerEvents: "none",
              background: mode === "world" && hovered.markerId === "london-cluster" ? "none" : "rgba(0,0,0,0.91)",
              color: mode === "world" && hovered.markerId === "london-cluster" ? "#b32c2c" : "#fff",
              borderRadius: 4,
              padding: mode === "world" && hovered.markerId === "london-cluster" ? "0" : "8px 18px",
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
            {mode === "world" && hovered.markerId === "london-cluster" ? arrowsSvg : null}
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
                ref={el => tocRefs.current[idx] = el}
                style={{
                  background: "none",
                  border: "none",
                  color: item.color,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "coolvetica, sans-serif",
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
                onMouseEnter={e => setHovered({ name: item.name, year: item.year, idx, label: item.name, markerId: item.marker.markerId })}
                onMouseLeave={e => setHovered(null)}
                tabIndex={0}
                aria-label={`Jump to ${item.name}`}
                title={item.name}
              >
                <span style={{
                  fontFamily: "coolvetica, sans-serif",
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
                  fontFamily: "coolvetica, sans-serif",
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
                    fontFamily: "coolvetica, sans-serif",
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
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: svgDims.width,
        height: svgDims.height,
        pointerEvents: 'none',
        zIndex: 90,
      }}>
        <svg width={svgDims.width} height={svgDims.height} style={{ display: 'block', width: svgDims.width, height: svgDims.height }}>
          {markerScreenPositions.map((markerPos, idx) => {
            const tocPos = tocScreenPositions[idx];
            if (!markerPos || !tocPos || typeof markerPos.x !== "number" || typeof markerPos.y !== "number" || typeof tocPos.x !== "number" || typeof tocPos.y !== "number") return null;
            return (
              <line
                key={idx}
                x1={markerPos.x}
                y1={markerPos.y}
                x2={tocPos.x}
                y2={tocPos.y}
                stroke="#ff2222"
                strokeWidth={6}
                opacity={1}
              />
            );
          })}
        </svg>
      </div>
    </section>
  );
}
