import dynamic from "next/dynamic";
import { useRef, useState, useMemo, useEffect } from "react";
import globeLocations from "../../data/globe-locations";
import * as THREE from "three";

// Dynamic import because react-globe.gl uses WebGL
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const LONDON_CLUSTER_GROUP = "london";
const LONDON_WHEEL_RADIUS = 0.6; // degrees, distance from cluster center
const LONDON_WHEEL_ALTITUDE = 0.018;
const DOT_SIZE = 1.2;
const DOT_ALTITUDE = 0.012;
const DOT_COLOR = "#b32c2c";
const CLUSTER_CENTER_COLOR = "#fff";
const CLUSTER_RING_COLOR = "#b32c2c";

function getLondonMarkers() {
  return globeLocations.filter((m) => m.clusterGroup === LONDON_CLUSTER_GROUP);
}
function getNonLondonMarkers() {
  return globeLocations.filter((m) => m.clusterGroup !== LONDON_CLUSTER_GROUP);
}
function getLondonClusterCenter() {
  // Average lat/lon of London markers
  const londonMarkers = getLondonMarkers();
  if (londonMarkers.length === 0) return { lat: 51.5, lng: -0.1 };
  const lat =
    londonMarkers.reduce((sum, m) => sum + m.lat, 0) / londonMarkers.length;
  const lng =
    londonMarkers.reduce((sum, m) => sum + m.lon, 0) / londonMarkers.length;
  return { lat, lng };
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
      // Collapse only if not clicking on a dot
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

  // Prepare pointsData
  const { pointsData, objectsData, customPointObject } = useMemo(() => {
    const londonMarkers = getLondonMarkers();
    const nonLondonMarkers = getNonLondonMarkers();
    const londonCenter = getLondonClusterCenter();

    // Default: non-London dots
    let pointsData = nonLondonMarkers.map((m) => ({
      ...m,
      lat: m.lat,
      lng: m.lon,
      color: DOT_COLOR,
      size: DOT_SIZE,
      altitude: DOT_ALTITUDE,
      markerId: m.name,
    }));

    let objectsData = [];
    let customPointObject = undefined;

    if (!londonExpanded) {
      // Show one cluster dot for London as a custom object
      objectsData = [
        {
          ...londonCenter,
          markerId: "london-cluster",
          isLondonCluster: true,
        },
      ];
      // Custom renderer for the cluster dot: white dot with red ring
      customPointObject = (obj) => {
        if (obj.isLondonCluster) {
          // Outer red ring
          const group = new THREE.Group();
          const ringGeom = new THREE.RingGeometry(0.38, 0.52, 48);
          const ringMat = new THREE.MeshBasicMaterial({
            color: CLUSTER_RING_COLOR,
            side: THREE.DoubleSide,
          });
          const ring = new THREE.Mesh(ringGeom, ringMat);
          ring.renderOrder = 1;
          group.add(ring);
          // Inner white dot
          const dotGeom = new THREE.CircleGeometry(0.36, 36);
          const dotMat = new THREE.MeshBasicMaterial({ color: CLUSTER_CENTER_COLOR });
          const dot = new THREE.Mesh(dotGeom, dotMat);
          dot.renderOrder = 2;
          group.add(dot);
          group.userData = { markerId: "london-cluster" };
          return group;
        }
        return null;
      };
    } else {
      // Expanded: show each London marker in a wheel formation
      const N = londonMarkers.length;
      const wheelRadius = LONDON_WHEEL_RADIUS;
      objectsData = londonMarkers.map((marker, idx) => {
        // Distribute points evenly around a circle
        const angle = (2 * Math.PI * idx) / N;
        // Offset by radius in degrees
        const lat =
          getLondonClusterCenter().lat +
          wheelRadius * Math.cos(angle);
        const lng =
          getLondonClusterCenter().lng +
          wheelRadius * Math.sin(angle);
        return {
          ...marker,
          lat,
          lng,
          color: DOT_COLOR,
          size: DOT_SIZE,
          altitude: LONDON_WHEEL_ALTITUDE,
          markerId: marker.name,
          isLondonWheel: true,
        };
      });
      // For wheel, all dots are red, same size
      customPointObject = (obj) => {
        if (obj.isLondonWheel) {
          const geom = new THREE.CircleGeometry(0.32, 32);
          const mat = new THREE.MeshBasicMaterial({ color: DOT_COLOR });
          const mesh = new THREE.Mesh(geom, mat);
          mesh.userData = { markerId: obj.markerId };
          return mesh;
        }
        return null;
      };
    }
    return { pointsData, objectsData, customPointObject };
  }, [londonExpanded]);

  // Handle clicking on London cluster or wheel dots
  const handleObjectClick = (obj) => {
    // Wheel collapsed: expand on cluster dot click
    if (obj && obj.markerId === "london-cluster") {
      setLondonExpanded(true);
      setHovered(null);
    } else if (obj && obj.isLondonWheel) {
      // Wheel expanded: click a London dot to open info and collapse
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

  // Responsive width/height
  const vw =
    typeof window !== "undefined" ? window.innerWidth : 1400;
  const globeWidth = Math.max(380, Math.min(950, vw * 0.88));
  const globeHeight = Math.max(340, Math.min(520, vw * 0.42));

  return (
    <section
      className="isp-globe-section"
      style={{
        width: "100vw",
        minHeight: 0,
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: "-10px",
        marginBottom: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: globeWidth,
          height: globeHeight,
          maxWidth: 950,
          minWidth: 320,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 auto",
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
              fontFamily:
                "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
    </section>
  );
}
