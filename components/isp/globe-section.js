import dynamic from "next/dynamic";
import { useRef, useState, useMemo, useEffect } from "react";
import globeLocations from "../../data/globe-locations";
import * as THREE from "three";
import {
  loadPinModel,
  orientPin,
  latLngAltToVec3,
  getPinModel,
  positionPin,
  ANALOGOUS_REDS,
  getAnalogousRedAssignments
} from "./modal/pin-utils";

// SVG expand icon as a string for the cluster marker
const LONDON_EXPAND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><polyline points="160 48 208 48 208 96" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="152" y1="104" x2="208" y2="48" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="96 208 48 208 48 160" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="104" y1="152" x2="48" y2="208" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="208 160 208 208 160 208" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="152" y1="152" x2="208" y2="208" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="48 96 48 48 96 48" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="104" y1="104" x2="48" y2="48" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>`;

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const LONDON_CLUSTER_GROUP = "london";
const LONDON_WHEEL_RADIUS = 1.1;
const LONDON_WHEEL_ALTITUDE = 0.018;

const DOT_ALTITUDE = 0.012;
const DOT_COLOR = "#b32c2c";
const CLUSTER_DOT_SIZE = 0.7 * 2.2;

// Offset for moving London cluster northwest (tweak as needed)
const LONDON_CLUSTER_OFFSET = { lat: 1.1, lng: -2.5 };

// Helper: SVG string to texture (returns a Promise)
function svgStringToTexture(svgString, size = 256) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const tex = new THREE.Texture(canvas);
      tex.needsUpdate = true;
      resolve(tex);
    };
    img.src = "data:image/svg+xml;utf8," + encodeURIComponent(svgString);
  });
}
// Cache for SVG texture
let expandSvgTexture = null;
async function getExpandTexture() {
  if (!expandSvgTexture) {
    expandSvgTexture = await svgStringToTexture(LONDON_EXPAND_SVG, 256);
  }
  return expandSvgTexture;
}

function getLondonMarkers() {
  return globeLocations.filter((m) => m.clusterGroup === LONDON_CLUSTER_GROUP);
}
function getNonLondonMarkers() {
  return globeLocations.filter((m) => m.clusterGroup !== LONDON_CLUSTER_GROUP);
}
function getLondonClusterCenter() {
  const londonMarkers = getLondonMarkers();
  if (londonMarkers.length === 0) return { lat: 51.5, lng: -0.1 };
  const lat = londonMarkers.reduce((sum, m) => sum + m.lat, 0) / londonMarkers.length;
  const lng = londonMarkers.reduce((sum, m) => sum + m.lon, 0) / londonMarkers.length;
  return { lat, lng };
}
function getLondonClusterCustomCoords(center) {
  return {
    lat: center.lat + LONDON_CLUSTER_OFFSET.lat,
    lng: center.lng + LONDON_CLUSTER_OFFSET.lng,
  };
}
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
function getComparisonMarkerIdx(nonLondonMarkers) {
  const idx = nonLondonMarkers.findIndex(m =>
    m.name.toLowerCase().includes("eastern state") || m.name.toLowerCase().includes("united states")
  );
  return idx !== -1 ? idx : 0;
}

export default function GlobeSection({ onMarkerClick }) {
  const globeEl = useRef();
  const globeContainerRef = useRef();
  const [hovered, setHovered] = useState(null);
  const [londonExpanded, setLondonExpanded] = useState(false);
  const [pinReady, setPinReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadPinModel().then(() => {
      if (mounted) setPinReady(true);
    });
    getExpandTexture();
    return () => { mounted = false; };
  }, []);

  const [markerScreenPositions, setMarkerScreenPositions] = useState([]);
  const tocRefs = useRef([]);
  const [tocScreenPositions, setTocScreenPositions] = useState([]);
  const [svgDims, setSvgDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (globeEl.current && typeof globeEl.current.pointOfView === "function") {
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);
    }
  }, []);

  useEffect(() => {
    if (!londonExpanded) return;
    const collapse = (e) => {
      if (
        !e.target.classList.contains("london-dot") &&
        !e.target.classList.contains("london-cluster-dot")
      ) {
        setLondonExpanded(false);
      }
    };
    window.addEventListener("mousedown", collapse);
    return () => window.removeEventListener("mousedown", collapse);
  }, [londonExpanded]);

  const [londonClusterScreenPos, setLondonClusterScreenPos] = useState(null);

  useEffect(() => {
    function updateLondonClusterScreenPos() {
      if (
        !globeEl.current ||
        typeof globeEl.current.getScreenCoords !== "function" ||
        !globeContainerRef.current ||
        londonExpanded
      ) {
        setLondonClusterScreenPos(null);
        return;
      }
      const { lat, lng } = getLondonClusterCenter();
      const coords = globeEl.current.getScreenCoords(lat, lng);
      const globeRect = globeContainerRef.current.getBoundingClientRect();
      setLondonClusterScreenPos({
        x: globeRect.left + coords.x,
        y: globeRect.top + coords.y,
      });
    }
    updateLondonClusterScreenPos();
    window.addEventListener("resize", updateLondonClusterScreenPos);
    let animationFrame;
    function poll() {
      updateLondonClusterScreenPos();
      animationFrame = requestAnimationFrame(poll);
    }
    animationFrame = requestAnimationFrame(poll);
    return () => {
      window.removeEventListener("resize", updateLondonClusterScreenPos);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [londonExpanded]);

  // --- ANALOGOUS RED PALETTE RANDOM ASSIGNMENT ---
  const redAssignments = useMemo(
    () => getAnalogousRedAssignments(globeLocations.length, 42),
    []
  );

  const {
    objectsData,
    linesData,
    customPointObject,
    customLineObject,
    tocList,
    comparisonMarkerIdx
  } = useMemo(() => {
    const londonMarkers = getLondonMarkers();
    const nonLondonMarkers = getNonLondonMarkers();
    const londonCenter = getLondonClusterCenter();
    const customClusterCoords = getLondonClusterCustomCoords(londonCenter);

    const tocList = globeLocations.map((marker, idx) => {
      let year = "";
      if (marker.timeline && marker.timeline.length > 0 && marker.timeline[0].year)
        year = marker.timeline[0].year;
      return {
        idx,
        roman: toRoman(idx + 1),
        name: marker.name,
        marker,
        year,
        color: redAssignments[idx]
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
          const globalIdx = globeLocations.findIndex(mm => mm.name === m.name);
          return {
            ...m,
            lat: m.lat,
            lng: m.lon,
            markerId: m.name,
            isStandardPin: true,
            showDotAndPin: idx === comparisonMarkerIdx,
            idx,
            altitude: DOT_ALTITUDE,
            color: redAssignments[globalIdx],
            label: m.name
          }
        }),
      ];

      customPointObject = (obj) => {
        // LONDON CLUSTER: SVG PLANE, NO WHITE CIRCLE, EVEN LARGER HIT AREA
        if (obj.isLondonCluster) {
          const group = new THREE.Group();
          const dotRadius = CLUSTER_DOT_SIZE * 2.5 * 1.5;
          const svgPlaneSize = dotRadius * 1.35;
          const svgGeom = new THREE.PlaneGeometry(svgPlaneSize * 2, svgPlaneSize * 2);
          const svgMat = new THREE.MeshBasicMaterial({
            transparent: true,
            depthTest: false,
            color: 0xffffff
          });
          const svgPlane = new THREE.Mesh(svgGeom, svgMat);
          svgPlane.position.set(0, 0, 0);
          svgPlane.renderOrder = 10;
          svgPlane.name = "london-expand-plane";
          getExpandTexture().then((tex) => {
            svgMat.map = tex;
            svgMat.needsUpdate = true;
          });
          group.add(svgPlane);

          // EVEN LARGER hit area for click/hover
          const hitGeom = new THREE.CircleGeometry(svgPlaneSize * 1.8, 48);
          const hitMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.01,
            depthWrite: false,
          });
          const hitCircle = new THREE.Mesh(hitGeom, hitMat);
          hitCircle.position.set(0, 0, 0.01);
          hitCircle.userData = { markerId: "london-cluster", label: "EXPAND" };
          hitCircle.name = "london-cluster-hit";
          group.add(hitCircle);

          group.userData = { markerId: "london-cluster", label: "EXPAND" };
          group.name = "london-cluster-group";
          return group;
        }

        // ALL OTHER PINS: even larger hit circle
        if (obj.isStandardPin && pinModel) {
          const group = new THREE.Group();
          const scale = 9 * 1.5;
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

          pin.userData = { markerId: obj.markerId };
          group.add(pin);

          // Hit area much bigger
          const hitGeom = new THREE.CircleGeometry(scale * 0.42, 32);
          const hitMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.01,
            depthWrite: false,
          });
          const hitCircle = new THREE.Mesh(hitGeom, hitMat);
          hitCircle.position.set(0, 0, scale * 0.6);
          hitCircle.userData = { markerId: obj.markerId, label: obj.label };
          hitCircle.name = "pin-hit-area";
          group.add(hitCircle);

          group.userData = { markerId: obj.markerId, label: obj.label };
          return group;
        }

        return null;
      };
    } else {
      // LONDON EXPANDED LOGIC (pins inside cluster = half of big size)
      const N = londonMarkers.length;
      const wheelRadius = LONDON_WHEEL_RADIUS * 1.3;
      const pinScale = 9 * 1.5 * 0.5; // half of big pin size

      objectsData = londonMarkers.map((marker, idx) => {
        const angle = (2 * Math.PI * idx) / N;
        const lat = londonCenter.lat + wheelRadius * Math.cos(angle);
        const lng = londonCenter.lng + wheelRadius * Math.sin(angle);
        const globalIdx = globeLocations.findIndex(m => m.name === marker.name);
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
          altitude: LONDON_WHEEL_ALTITUDE,
          pinScale,
          color: redAssignments[globalIdx]
        };
      });

      linesData = objectsData.map((obj) => ({
        start: {
          lat: londonCenter.lat,
          lng: londonCenter.lng,
          alt: LONDON_WHEEL_ALTITUDE,
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

          // Hit area much bigger
          const hitGeom = new THREE.CircleGeometry(scale * 0.42, 32);
          const hitMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.01,
            depthWrite: false,
          });
          const hitCircle = new THREE.Mesh(hitGeom, hitMat);
          hitCircle.position.set(0, 0, scale * 0.6);
          hitCircle.userData = { markerId: obj.markerId, label: obj.label };
          hitCircle.name = "pin-hit-area";
          group.add(hitCircle);

          group.userData = { markerId: obj.markerId, label: obj.label };
          return group;
        }
        return null;
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
  }, [londonExpanded, pinReady, redAssignments]);

  useEffect(() => {
    function updateMarkerPositions() {
      if (
        !globeEl.current ||
        typeof globeEl.current.getScreenCoords !== "function" ||
        !globeContainerRef.current
      )
        return;

      const globeRect = globeContainerRef.current.getBoundingClientRect();

      const positions = globeLocations.map((marker) => {
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
  }, []);

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

  const handleObjectClick = (obj) => {
    if (obj && obj.markerId === "london-cluster") {
      setLondonExpanded(true);
      setHovered(null);
    } else if (obj && obj.isLondonWheel) {
      const marker = getLondonMarkers().find((m) => m.name === obj.markerId);
      if (marker) {
        onMarkerClick(marker);
      }
      setLondonExpanded(false);
      setHovered(null);
    } else if (obj && obj.isStandardPin) {
      const marker = globeLocations.find((m) => m.name === obj.markerId);
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

  const bannerHeight = 76 + 44 + 26 + 16;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const availHeight = Math.max(380, vh - bannerHeight);
  const globeWidth = Math.max(500, Math.min(950, vw * 0.93)) * 1.3;
  const globeHeight = Math.max(460, Math.min(availHeight, vw * 0.60)) * 1.3;
  function handleTOCClick(marker) {
    onMarkerClick(marker);
    setLondonExpanded(false);
    setHovered(null);
  }
  const isMobile = vw < 800;

  // Overlay for all pins and London cluster
  const showPinOverlay = hovered && (hovered.label || hovered.name) && markerScreenPositions && markerScreenPositions.length > 0;
  let overlayText = hovered?.label || hovered?.name;
  // For cluster overlay, always say EXPAND
  if (hovered && hovered.markerId === "london-cluster") overlayText = "EXPAND";

  // Get overlay position: for cluster use cluster pos, else for pins use marker positions
  let overlayPos = null;
  if (hovered && hovered.markerId === "london-cluster" && londonClusterScreenPos) {
    overlayPos = { x: londonClusterScreenPos.x, y: londonClusterScreenPos.y - 32 };
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
          pointsData={[]} 
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="size"
          pointAltitude="altitude"
          pointLabel="label"
          onPointHover={setHovered}
          onPointClick={onMarkerClick}
          objectsData={objectsData}
          objectLat="lat"
          objectLng="lng"
          objectAltitude={(obj) => obj.altitude || DOT_ALTITUDE}
          objectThreeObject={customPointObject}
          onObjectClick={handleObjectClick}
          onObjectHover={handleObjectHover}
          linesData={londonExpanded ? linesData : []}
          lineStartLat={(l) => l.start.lat}
          lineStartLng={(l) => l.start.lng}
          lineStartAltitude={(l) => l.start.alt}
          lineEndLat={(l) => l.end.lat}
          lineEndLng={(l) => l.end.lng}
          lineEndAltitude={(l) => l.end.alt}
          lineThreeObject={londonExpanded ? customLineObject : undefined}
        />
        {/* Overlay for all pins and London cluster */}
        {showPinOverlay && overlayPos && (
          <div
            style={{
              position: "fixed",
              left: overlayPos.x ?? 0,
              top: overlayPos.y ?? 0,
              zIndex: 9999,
              pointerEvents: "none",
              background: hovered.markerId === "london-cluster" ? "none" : "rgba(0,0,0,0.91)",
              color: hovered.markerId === "london-cluster" ? "#b32c2c" : "#fff",
              borderRadius: 4,
              padding: hovered.markerId === "london-cluster" ? "0" : "8px 18px",
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
            {hovered.markerId === "london-cluster" ? arrowsSvg : null}
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
                  fontSize: 16,
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
