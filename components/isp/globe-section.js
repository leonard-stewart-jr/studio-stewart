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
  getAnalogousRedAssignments
} from "./modal/pin-utils";

const LONDON_EXPAND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><polyline points="160 48 208 48 208 96" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="152" y1="104" x2="208" y2="48" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="96 208 48 208 48 160" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="104" y1="152" x2="48" y2="208" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="208 160 208 208 160 208" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="152" y1="152" x2="208" y2="208" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="48 96 48 48 96 48" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="104" y1="104" x2="48" y2="48" fill="none" stroke="#b32c2c" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>`;

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const LONDON_CLUSTER_GROUP = "london";
const LONDON_WHEEL_RADIUS = 1.1;
const LONDON_WHEEL_ALTITUDE = 0.018;

const DOT_ALTITUDE = 0.012;
const CLUSTER_DOT_SIZE = 0.7 * 2.2;

// UK-centered cluster offset
const LONDON_CLUSTER_OFFSET = { lat: 2.1, lng: -3.2 };

// Pin scales
const NORMAL_PIN_SCALE = 9 * 1.5;
const CLUSTER_PIN_SCALE = NORMAL_PIN_SCALE * 0.5; // half as large as normal pin
const HITBOX_BUFFER = 1.07; // 7% buffer

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

// Helper to create a buffered hitbox geometry using the pin mesh's bounding box
function bufferedBoundingGeometry(mesh, buffer = 1.07) {
  // Compute bounding box
  const box = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  box.getSize(size);
  // Center
  const center = new THREE.Vector3();
  box.getCenter(center);
  // Buffered box geometry
  const geom = new THREE.BoxGeometry(size.x * buffer, size.y * buffer, size.z * buffer);
  geom.translate(center.x, center.y, center.z);
  return geom;
}

export default function GlobeSection({ onMarkerClick }) {
  const globeEl = useRef();
  const globeContainerRef = useRef();
  const [hovered, setHovered] = useState(null);
  const [londonExpanded, setLondonExpanded] = useState(false);
  const [pinReady, setPinReady] = useState(false);

  // Responsive mobile state
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 800);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // For the 3D "EXPAND" overlay
  const [expandLabelMat, setExpandLabelMat] = useState(null);
  useEffect(() => {
    function makeExpandLabelMaterial() {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, size, size);
      ctx.font = "bold 64px coolvetica, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "#222";
      ctx.shadowBlur = 10;
      ctx.fillText("EXPAND", size / 2, size / 2);
      const texture = new THREE.CanvasTexture(canvas);
      return new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.97,
        depthTest: false,
        depthWrite: false,
      });
    }
    setExpandLabelMat(makeExpandLabelMaterial());
  }, []);

  const [markerScreenPositions, setMarkerScreenPositions] = useState([]);
  const tocRefs = useRef([]);
  const [tocScreenPositions, setTocScreenPositions] = useState([]);
  const [svgDims, setSvgDims] = useState({ width: 0, height: 0 });

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
    comparisonMarkerIdx,
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

          // Hit area (buffered plane, but not huge)
          const hitGeom = new THREE.PlaneGeometry(svgPlaneSize * HITBOX_BUFFER * 2, svgPlaneSize * HITBOX_BUFFER * 2);
          const hitMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.01,
            depthWrite: false,
          });
          const hitPlane = new THREE.Mesh(hitGeom, hitMat);
          hitPlane.position.set(0, 0, 0.02);
          hitPlane.userData = { markerId: "london-cluster", label: "EXPAND" };
          hitPlane.name = "london-cluster-hit";
          group.add(hitPlane);

          group.userData = { markerId: "london-cluster", label: "EXPAND" };
          group.name = "london-cluster-group";
          return group;
        }

        if (obj.isStandardPin && pinModel) {
          // Pin mesh + buffered hitbox (buffered by 7%)
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
        // Always return a valid THREE.Object3D
        return new THREE.Object3D();
      };
    } else {
      const N = londonMarkers.length;
      const wheelRadius = LONDON_WHEEL_RADIUS * 0.6;
      const pinScale = CLUSTER_PIN_SCALE;

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
          // Pin mesh + buffered hitbox (buffered by 7%)
          const group = new THREE.Group();
          const scale = obj.pinScale ?? CLUSTER_PIN_SCALE;
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
        // Always return a valid THREE.Object3D
        return new THREE.Object3D();
      };
    }
    return { objectsData, linesData, customPointObject, customLineObject, tocList, comparisonMarkerIdx };
  }, [londonExpanded, pinReady, redAssignments]);

  function getExpandSprite() {
    if (
      hovered &&
      hovered.markerId === "london-cluster" &&
      expandLabelMat &&
      !londonExpanded
    ) {
      const { lat, lng } = getLondonClusterCustomCoords(getLondonClusterCenter());
      const vec = latLngAltToVec3(lat, lng, DOT_ALTITUDE + 0.11);
      const expandSprite = new THREE.Sprite(expandLabelMat);
      expandSprite.position.copy(vec);
      expandSprite.scale.set(0.38, 0.12, 1.0);
      expandSprite.center.set(0.5, 0.5);
      expandSprite.renderOrder = 1000;
      expandSprite.material.needsUpdate = true;
      expandSprite.name = "expand-sprite";
      return expandSprite;
    }
    return null;
  }

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
    if (obj && obj.markerId === "london-cluster") {
      setHovered({ ...obj, label: "EXPAND" });
    } else {
      setHovered(obj);
    }
  };

  const showPinOverlay =
    hovered &&
    hovered.markerId !== "london-cluster" &&
    (hovered.label || hovered.name) &&
    markerScreenPositions &&
    markerScreenPositions.length > 0;

  let overlayPos = null;
  if (
    showPinOverlay &&
    typeof hovered.idx === "number" &&
    markerScreenPositions[hovered.idx]
  ) {
    overlayPos = {
      x: markerScreenPositions[hovered.idx].x,
      y: markerScreenPositions[hovered.idx].y + 18,
    };
  }

  const expandSprite = getExpandSprite();

  return (
    <section
      className="isp-globe-section"
      style={{
        width: "100vw",
        minHeight: "500px",
        height: "auto",
        background: "transparent",
        display: "flex",
        flexDirection: "column",
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
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative"
        }}
      >
        <Globe
          ref={globeEl}
          globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
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
          linesData={londonExpanded ? linesData : []}
          lineStartLat={(l) => l.start.lat}
          lineStartLng={(l) => l.start.lng}
          lineStartAltitude={(l) => l.start.alt}
          lineEndLat={(l) => l.end.lat}
          lineEndLng={(l) => l.end.lng}
          lineEndAltitude={(l) => l.end.alt}
          lineThreeObject={londonExpanded ? customLineObject : undefined}
          extraRenderers={
            expandSprite
              ? [
                  (scene) => {
                    if (!scene.getObjectByName("expand-sprite")) {
                      scene.add(expandSprite);
                    }
                  },
                ]
              : [
                  (scene) => {
                    const obj = scene.getObjectByName("expand-sprite");
                    if (obj) scene.remove(obj);
                  },
                ]
          }
        />
        {showPinOverlay && overlayPos && (
          <div
            style={{
              position: "fixed",
              left: overlayPos.x ?? 0,
              top: overlayPos.y ?? 0,
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
              whiteSpace: "nowrap"
            }}
          >
            {hovered.label || hovered.name}
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
                onClick={() => onMarkerClick(item.marker)}
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
