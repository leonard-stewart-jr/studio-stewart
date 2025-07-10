import dynamic from "next/dynamic";
import { useRef, useState, useMemo, useEffect } from "react";
import globeLocations from "../../data/globe-locations";
import * as THREE from "three";

// Dynamic import because react-globe.gl uses WebGL
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const LONDON_CLUSTER_GROUP = "london";
const LONDON_WHEEL_RADIUS = 0.6;
const LONDON_WHEEL_ALTITUDE = 0.018;

// --- DOT SIZE CONSTANTS ---
// All cluster/center/cluster wheel red dots and the white cluster dot are now based on DOT_SIZE
const DOT_SIZE = 1.05; // Base size for normal timeline red dots

// Sizing per latest user instructions:
const CLUSTER_WHEEL_DOT_SIZE = DOT_SIZE * 0.75; // red icon in cluster: 3/4 normal red dot size
const CLUSTER_DOT_SIZE = DOT_SIZE * 1.5;        // white icon in cluster: 1.5x normal red dot size

const DOT_ALTITUDE = 0.012;
const DOT_COLOR = "#b32c2c";
const CLUSTER_CENTER_COLOR = "#fff";
const CLUSTER_RING_COLOR = "#b32c2c";
const CLUSTER_RING_RATIO = 0.74;
const CLUSTER_RING_ALT_OFFSET = 0.0035; // More visible above white

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

// Utility: convert lat/lng/altitude to 3D xyz for Three.js globe radius 1
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

// ---- Roman numeral utility ----
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

export default function GlobeSection({ onMarkerClick }) {
  const globeEl = useRef();
  const [hovered, setHovered] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [londonExpanded, setLondonExpanded] = useState(false);

  // Tooltip mouse position tracking
  useEffect(() => {
    const handleMouseMove = (e) =>
      setMouse({ x: e.clientX, y: e.clientY });
    if (hovered) window.addEventListener("mousemove", handleMouseMove);
    else setMouse({ x: 0, y: 0 });
    return () =>
      window.removeEventListener("mousemove", handleMouseMove);
  }, [hovered]);

  // Auto center globe
  useEffect(() => {
    if (globeEl.current && typeof globeEl.current.pointOfView === "function") {
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);
    }
  }, []);

  // Wheel click/collapse
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

  // Prepare pointsData, objectsData, linesData, customPointObject, customLineObject, tocList
  const {
    pointsData,
    objectsData,
    linesData,
    customPointObject,
    customLineObject,
    tocList
  } = useMemo(() => {
    const londonMarkers = getLondonMarkers();
    const nonLondonMarkers = getNonLondonMarkers();
    const londonCenter = getLondonClusterCenter();

    // Table of Contents: Use ALL locations, in order as in globeLocations
    // --- PATCH: Update titles for 1 and 2 to match custom titles ---
    const tocList = globeLocations.map((marker, idx) => {
      let overrideName = marker.name;
      if (idx === 0) overrideName = "MESOPOTAMIA: THE FIRST PRISONS";
      if (idx === 1) overrideName = "THE MAMERTINE PRISON (CARCER TULLIANUM)";
      // Date for second line
      let year = "";
      if (marker.timeline && marker.timeline.length > 0 && marker.timeline[0].year)
        year = marker.timeline[0].year;
      return {
        idx,
        roman: toRoman(idx + 1),
        name: overrideName,
        marker,
        year,
      }
    });

    // Default: non-London dots
    let pointsData = nonLondonMarkers.map((m) => ({
      ...m,
      lat: m.lat,
      lng: m.lon,
      color: DOT_COLOR,
      size: DOT_SIZE * 1.3, // SCALE UP ALL DOTS BY 1.3x
      altitude: DOT_ALTITUDE,
      markerId: m.name,
    }));

    let objectsData = [];
    let linesData = [];
    let customPointObject = undefined;
    let customLineObject = undefined;

    if (!londonExpanded) {
      // Show one cluster dot for London as a custom object
      objectsData = [
        {
          ...londonCenter,
          markerId: "london-cluster",
          isLondonCluster: true,
          altitude: DOT_ALTITUDE,
        },
      ];
      // Custom renderer for the cluster dot: white dot with red ring, at CLUSTER_DOT_SIZE (white 1.5x red)
      customPointObject = (obj) => {
        if (obj.isLondonCluster) {
          const group = new THREE.Group();
          const dotRadius = CLUSTER_DOT_SIZE * 0.5 * 1.3; // White dot: 1.5x DOT_SIZE, then 1.3x for global scaling
          // White dot at base altitude
          const dotGeom = new THREE.CircleGeometry(dotRadius, 42);
          const dotMat = new THREE.MeshBasicMaterial({ color: CLUSTER_CENTER_COLOR });
          const dot = new THREE.Mesh(dotGeom, dotMat);
          dot.renderOrder = 2;
          dot.position.set(0, 0, 0);
          group.add(dot);

          // Red ring, slightly above base altitude for visibility
          const ringOuter = dotRadius * CLUSTER_RING_RATIO;
          const ringInner = ringOuter * 0.76;
          const ringGeom = new THREE.RingGeometry(ringInner, ringOuter, 48);
          const ringMat = new THREE.MeshBasicMaterial({
            color: CLUSTER_RING_COLOR,
            side: THREE.DoubleSide,
            transparent: false,
          });
          const ring = new THREE.Mesh(ringGeom, ringMat);
          ring.position.set(0, 0, CLUSTER_RING_ALT_OFFSET * 100); // move up slightly (100x for scale)
          ring.renderOrder = 3;
          group.add(ring);

          group.userData = { markerId: "london-cluster" };
          return group;
        }
        return null;
      };
    } else {
      // Expanded: show each London marker in a wheel formation (red dots, 0.75x DOT_SIZE)
      const N = londonMarkers.length;
      const wheelRadius = LONDON_WHEEL_RADIUS * 1.3; // SCALE UP BY 1.3x
      objectsData = londonMarkers.map((marker, idx) => {
        const angle = (2 * Math.PI * idx) / N;
        const lat = londonCenter.lat + wheelRadius * Math.cos(angle);
        const lng = londonCenter.lng + wheelRadius * Math.sin(angle);
        return {
          ...marker,
          lat,
          lng,
          color: DOT_COLOR,
          size: CLUSTER_WHEEL_DOT_SIZE * 1.3, // (DOT_SIZE * 0.75) * 1.3
          altitude: LONDON_WHEEL_ALTITUDE,
          markerId: marker.name,
          isLondonWheel: true,
          actualLat: marker.lat,
          actualLng: marker.lon,
        };
      });

      // Dotted, semi-transparent lines from cluster center to real locations
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

      // Custom renderer for the cluster wheel dots (smaller red)
      customPointObject = (obj) => {
        if (obj.isLondonWheel) {
          const geom = new THREE.CircleGeometry(CLUSTER_WHEEL_DOT_SIZE * 0.5 * 1.3, 32);
          // (DOT_SIZE * 0.75 * 0.5 * 1.3) radius
          const mat = new THREE.MeshBasicMaterial({ color: DOT_COLOR });
          const mesh = new THREE.Mesh(geom, mat);
          mesh.userData = { markerId: obj.markerId };
          return mesh;
        }
        return null;
      };

      // Custom renderer for the lines (dotted, semi-transparent red)
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
    return { pointsData, objectsData, linesData, customPointObject, customLineObject, tocList };
  }, [londonExpanded]);

  // Handle clicking on London cluster or wheel dots
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
    }
  };

  // Hover logic for custom objects (cluster, wheel)
  const handleObjectHover = (obj) => {
    if (!obj) {
      setHovered(null);
      return;
    }
    if (obj.markerId === "london-cluster") {
      setHovered({
        name: "London Cluster: Expand to see sites",
        year: "",
      });
    } else if (obj.isLondonWheel) {
      const marker = getLondonMarkers().find((m) => m.name === obj.markerId);
      setHovered(marker ? { name: marker.name, year: marker.timeline?.[0]?.year || "" } : null);
    }
  };

  // Responsive width/height - use available viewport height minus banners (76+44+26)
  const bannerHeight = 76 + 44 + 26 + 16; // add 16px for nav gaps/margins
  const vw = typeof window !== "undefined" ? window.innerWidth : 1400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const availHeight = Math.max(380, vh - bannerHeight);

  // Globe size: make globe as large as possible, responsive, but avoid overflow on small screens
  // INCREASE GLOBE SIZE by 1.3x AGAIN (total scaling: 1.69x original)
  const globeWidth = Math.max(500, Math.min(950, vw * 0.93)) * 1.3;
  const globeHeight = Math.max(460, Math.min(availHeight, vw * 0.60)) * 1.3;

  // TOC click handler
  function handleTOCClick(marker) {
    onMarkerClick(marker);
    setLondonExpanded(false);
    setHovered(null);
  }

  // Responsive: stack on mobile, row on desktop
  const isMobile = vw < 800;

  // Vertically center globe and TOC in available space below banners, but shift both down by 84px
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
        // SHIFT SECTION DOWN 84px
        marginTop: 57,
      }}
    >
      {/* Globe on the left */}
      <div
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
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="size"
          pointAltitude="altitude"
          onPointHover={setHovered}
          onPointClick={onMarkerClick}
          //
          objectsData={objectsData}
          objectLat="lat"
          objectLng="lng"
          objectAltitude={(obj) => obj.altitude || DOT_ALTITUDE}
          objectThreeObject={customPointObject}
          onObjectClick={handleObjectClick}
          onObjectHover={handleObjectHover}
          //
          linesData={londonExpanded ? linesData : []}
          lineStartLat={(l) => l.start.lat}
          lineStartLng={(l) => l.start.lng}
          lineStartAltitude={(l) => l.start.alt}
          lineEndLat={(l) => l.end.lat}
          lineEndLng={(l) => l.end.lng}
          lineEndAltitude={(l) => l.end.alt}
          lineThreeObject={londonExpanded ? customLineObject : undefined}
        />
        {/* Tooltip for marker hover */}
        {hovered && (
          <div
            style={{
              position: "fixed",
              left: mouse.x + 18,
              top: mouse.y + 18,
              zIndex: 100,
              pointerEvents: "none",
              background: "#fff",
              color: "#181818",
              borderRadius: 7,
              boxShadow: "0 1.5px 12px rgba(32,32,32,0.15)",
              padding: "10px 16px",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: 15,
              minWidth: 120,
              maxWidth: 260,
              border: "1px solid #e6dbb9",
              opacity: 0.98,
              transition: "opacity 0.15s",
              lineHeight: "1.32",
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {hovered.name}
            </div>
            {hovered.year && (
              <div
                style={{
                  fontSize: 13,
                  color: "#b1b1ae",
                  marginTop: 2,
                  fontWeight: 400,
                }}
              >
                {hovered.year}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Table of Contents on the right */}
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
                  color: "#b32c2c",
                  fontWeight: 600,
                  fontSize: 11,
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
                onMouseEnter={e => setHovered({ name: item.name, year: item.year })}
                onMouseLeave={e => setHovered(null)}
                tabIndex={0}
                aria-label={`Jump to ${item.name}`}
                title={item.name}
              >
                <span style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", // CHANGED from "serif"
                  fontWeight: 700, // CHANGED from 400, now bold
                  fontSize: 12,
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
                  fontSize: 11,
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
                    fontSize: 9.1,
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
