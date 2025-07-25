import dynamic from "next/dynamic";
import { useRef, useState, useMemo, useEffect } from "react";
import globeLocations from "../../data/globe-locations";
import * as THREE from "three";
import {
  loadPinModel,
  orientPin,
  latLngAltToVec3,
  getPinModel,
  positionPin
} from "./modal/pin-utils";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const LONDON_CLUSTER_GROUP = "london";
const LONDON_WHEEL_RADIUS = 1.1;
const LONDON_WHEEL_ALTITUDE = 0.018;

const DOT_ALTITUDE = 0.012;
const DOT_COLOR = "#b32c2c";
const CLUSTER_CENTER_COLOR = "#fff";
const CLUSTER_RING_COLOR = "#b32c2c";
const CLUSTER_DOT_SIZE = 0.7 * 2.2;
const CLUSTER_RING_RATIO = 0.74;
const CLUSTER_RING_ALT_OFFSET = 0.0035;

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

    // CHANGE: Always use marker.name for TOC titles
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
          ...londonCenter,
          markerId: "london-cluster",
          isLondonCluster: true,
          altitude: DOT_ALTITUDE,
          label: "London Cluster",
        },
        ...nonLondonMarkers.map((m, idx) => ({
          ...m,
          lat: m.lat,
          lng: m.lon,
          markerId: m.name,
          isStandardPin: true,
          showDotAndPin: idx === comparisonMarkerIdx,
          idx,
          altitude: DOT_ALTITUDE,
        })),
      ];

      customPointObject = (obj) => {
        if (obj.isLondonCluster) {
          const group = new THREE.Group();
          const dotRadius = CLUSTER_DOT_SIZE * 1.7;
          const dotGeom = new THREE.CircleGeometry(dotRadius, 42);
          const dotMat = new THREE.MeshBasicMaterial({ color: CLUSTER_CENTER_COLOR, side: THREE.DoubleSide, transparent: false });
          const dot = new THREE.Mesh(dotGeom, dotMat);
          dot.renderOrder = 2;
          dot.position.set(0, 0, 0);
          dot.name = "london-cluster-dot";
          dot.userData = { markerId: "london-cluster" };
          group.add(dot);

          const ringOuter = dotRadius * CLUSTER_RING_RATIO;
          const ringInner = ringOuter * 0.76;
          const ringGeom = new THREE.RingGeometry(ringInner, ringOuter, 48);
          const ringMat = new THREE.MeshBasicMaterial({
            color: CLUSTER_RING_COLOR,
            side: THREE.DoubleSide,
            transparent: false,
          });
          const ring = new THREE.Mesh(ringGeom, ringMat);
          ring.position.set(0, 0, CLUSTER_RING_ALT_OFFSET * 100);
          ring.renderOrder = 3;
          group.add(ring);

          group.userData = { markerId: "london-cluster" };
          group.name = "london-cluster-group";
          return group;
        }

        if (obj.isStandardPin && pinModel) {
          const group = new THREE.Group();
          const scale = 8;
          const pin = pinModel.clone(true);
          pin.traverse((child) => {
            if (child.isMesh) child.castShadow = false;
          });
          pin.scale.set(scale, scale, scale);

          const markerVec = latLngAltToVec3(obj.lat, obj.lng, obj.altitude);
          group.position.copy(markerVec);
          orientPin(pin, markerVec);
          positionPin(pin, 3); // Pin tip at surface

          pin.userData = { markerId: obj.markerId };
          group.add(pin);
          group.userData = { markerId: obj.markerId };
          return group;
        }
        return null;
      };

    } else {
      const N = londonMarkers.length;
      const wheelRadius = LONDON_WHEEL_RADIUS * 1.3;
      const pinScale = 7 * (2 / 3);

      objectsData = londonMarkers.map((marker, idx) => {
        const angle = (2 * Math.PI * idx) / N;
        const lat = londonCenter.lat + wheelRadius * Math.cos(angle);
        const lng = londonCenter.lng + wheelRadius * Math.sin(angle);
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
            if (child.isMesh) child.castShadow = false;
          });
          pin.scale.set(scale, scale, scale);

          const markerVec = latLngAltToVec3(obj.lat, obj.lng, obj.altitude);
          group.position.copy(markerVec);
          orientPin(pin, markerVec);
          positionPin(pin, 0);

          pin.userData = { markerId: obj.markerId };
          group.add(pin);
          group.userData = { markerId: obj.markerId };
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
  }, [londonExpanded, pinReady]);

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

  const showLondonExpandOverlay =
    hovered &&
    hovered.markerId === "london-cluster" &&
    !londonExpanded &&
    londonClusterScreenPos;

  const showPinOverlay = hovered && hovered.name && !londonExpanded && markerScreenPositions && markerScreenPositions.length > 0;

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
        {showLondonExpandOverlay && (
          <div
            style={{
              position: "fixed",
              left: londonClusterScreenPos?.x ?? 0,
              top: (londonClusterScreenPos?.y ?? 0) + 18,
              zIndex: 9999,
              pointerEvents: "auto",
              background: "yellow",
              color: "black",
              border: "2px solid red",
              borderRadius: 4,
              padding: "8px 18px",
              fontWeight: 700,
              fontSize: 18,
              transform: "translate(-50%, 0)",
              whiteSpace: "nowrap",
            }}
          >
            EXPAND
          </div>
        )}
        {showLondonExpandOverlay && (
          <div style={{position:'fixed',top:0,left:0,zIndex:9999,color:'red',background:'white'}}>
            DEBUG: showLondonExpandOverlay is TRUE. X: {londonClusterScreenPos?.x}, Y: {londonClusterScreenPos?.y}
          </div>
        )}
        {/* Overlay for regular pins (with .name) */}
        {showPinOverlay && (
          <div
            style={{
              position: "fixed",
              left: markerScreenPositions[hovered.idx]?.x ?? 0,
              top: (markerScreenPositions[hovered.idx]?.y ?? 0) + 18,
              zIndex: 999,
              pointerEvents: "none",
              background: "rgba(0,0,0,0.91)",
              color: "#fff",
              borderRadius: 4,
              padding: "8px 18px",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
            {hovered.name}
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
                  color: "#b32c2c",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
                onMouseEnter={e => setHovered({ name: item.name, year: item.year, idx })}
                onMouseLeave={e => setHovered(null)}
                tabIndex={0}
                aria-label={`Jump to ${item.name}`}
                title={item.name}
              >
                <span style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  minWidth: 18,
                  letterSpacing: ".03em",
                  marginRight: 2,
                  color: "#b32c2c",
                  opacity: 0.93,
                  flexShrink: 0,
                }}>{item.roman}.</span>
                <span style={{
                  flex: 1,
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
        pointerEvents: "none",
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
