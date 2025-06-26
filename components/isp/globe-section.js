import dynamic from "next/dynamic";
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import globeLocations from "../../data/globe-locations";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";

// Dynamic import because react-globe.gl uses WebGL
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const LONDON_CLUSTER_KEY = "london";
const RING_COLOR = "#b32c2c";
const RING_RADIUS = 1.25;
const RING_TUBE = 0.23;
const DOT_RADIUS = 1.1;

function getLondonClusterCenter(londonMarkers) {
  // Average lat/lon for London group
  const avgLat = londonMarkers.reduce((a, m) => a + m.lat, 0) / londonMarkers.length;
  const avgLon = londonMarkers.reduce((a, m) => a + m.lon, 0) / londonMarkers.length;
  return { lat: avgLat, lon: avgLon };
}

export default function GlobeSection({ onMarkerClick }) {
  const globeEl = useRef();
  const [hovered, setHovered] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [expandedCluster, setExpandedCluster] = useState(null); // "london" or null

  // --- PREP DATA
  const londonMarkers = useMemo(
    () => globeLocations.filter(m => m.clusterGroup === LONDON_CLUSTER_KEY),
    [globeLocations]
  );
  const nonLondonMarkers = useMemo(
    () => globeLocations.filter(m => m.clusterGroup !== LONDON_CLUSTER_KEY),
    [globeLocations]
  );
  const londonCenter = useMemo(
    () => getLondonClusterCenter(londonMarkers),
    [londonMarkers]
  );

  // --- Calculate wheel positions for expanded view
  const expandedLondonDots = useMemo(() => {
    if (!expandedCluster) return [];
    const N = londonMarkers.length;
    const R = 2.2; // degrees to spread out
    // Place in a circle around the center
    return londonMarkers.map((marker, i) => {
      const theta = (2 * Math.PI * i) / N - Math.PI / 2; // start at top
      return {
        ...marker,
        lat: londonCenter.lat + R * Math.cos(theta) / 111, // ~1 deg lat = 111km
        lon: londonCenter.lon + (R * Math.sin(theta)) / (111 * Math.cos(londonCenter.lat * Math.PI / 180)),
        _isLondonWheel: true,
        _wheelIndex: i,
      };
    });
  }, [expandedCluster, londonMarkers, londonCenter]);

  // --- Globe camera and controls setup
  useEffect(() => {
    if (globeEl.current && typeof globeEl.current.pointOfView === "function") {
      globeEl.current.pointOfView({ lat: 39.6, lng: -98.5, altitude: 2 });
    }
  }, []);
  useEffect(() => {
    if (globeEl.current && typeof globeEl.current.controls === "function" && globeEl.current.controls()) {
      globeEl.current.controls().enableZoom = false;
    }
  }, []);

  // Mouse move listener for tooltip position
  useEffect(() => {
    const handleMouseMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    if (hovered) window.addEventListener("mousemove", handleMouseMove);
    else setMouse({ x: 0, y: 0 });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hovered]);

  // Helper to get first timeline year for tooltip
  function getFirstYear(marker) {
    if (marker.timeline && marker.timeline.length > 0) return marker.timeline[0].year;
    return null;
  }

  // Responsive width/height
  const vw = typeof window !== "undefined" ? window.innerWidth : 1400;
  const globeWidth = Math.max(380, Math.min(950, vw * 0.88));
  const globeHeight = Math.max(340, Math.min(520, vw * 0.42));

  // --- Custom object logic for ring and wheel dots
  const renderRing = useCallback((marker) => {
    const geometry = new THREE.TorusGeometry(RING_RADIUS, RING_TUBE, 20, 64);
    const material = new THREE.MeshBasicMaterial({ color: RING_COLOR, transparent: true, opacity: 0.97 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { marker, isRing: true };
    return mesh;
  }, []);
  const renderDot = useCallback((marker) => {
    const geometry = new THREE.SphereGeometry(DOT_RADIUS, 24, 24);
    const material = new THREE.MeshBasicMaterial({ color: RING_COLOR, transparent: false });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { marker, isRing: false };
    return mesh;
  }, []);
  // For fade animation
  const fadeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  // --- Click handlers
  function handleCustomLayerClick(obj) {
    if (!obj || !obj.userData) return;
    if (obj.userData.isRing) {
      setExpandedCluster(LONDON_CLUSTER_KEY);
      setHovered(null);
    } else {
      setExpandedCluster(null);
      onMarkerClick && onMarkerClick(obj.userData.marker);
    }
  }
  function handleCustomLayerHover(obj) {
    setHovered(obj ? obj.userData.marker : null);
  }
  // Clicking globe background should close expanded
  useEffect(() => {
    const handler = () => setExpandedCluster(null);
    if (expandedCluster) {
      window.addEventListener("click", handler, true);
      return () => window.removeEventListener("click", handler, true);
    }
  }, [expandedCluster]);

  // --- Compose layer data for Globe
  const customLayerData = useMemo(() => {
    let data = [];
    if (expandedCluster === LONDON_CLUSTER_KEY) {
      data = [
        ...nonLondonMarkers,
        ...expandedLondonDots // wheel dots
      ];
    } else {
      data = [
        ...nonLondonMarkers,
        {
          ...londonCenter,
          name: "London Cluster",
          _isLondonRing: true
        }
      ];
    }
    return data;
  }, [expandedCluster, nonLondonMarkers, expandedLondonDots, londonCenter]);

  // --- Render
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
          customLayerData={customLayerData}
          customThreeObject={d =>
            d._isLondonRing ? renderRing(d) : renderDot(d)
          }
          customThreeObjectUpdate={(obj, d) => {
            obj.userData = { marker: d, isRing: !!d._isLondonRing };
          }}
          onCustomLayerClick={handleCustomLayerClick}
          onCustomLayerHover={handleCustomLayerHover}
          pointsData={[]} // hide default points
          backgroundColor="rgba(0,0,0,0)"
          width={globeWidth}
          height={globeHeight}
        />
        {/* Animated fade for the wheel */}
        <AnimatePresence>
          {expandedCluster === LONDON_CLUSTER_KEY && (
            <motion.div
              key="london-wheel"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeVariants}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: globeWidth,
                height: globeHeight,
                pointerEvents: "none", // let globe handle
                zIndex: 8,
              }}
            />
          )}
        </AnimatePresence>
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
              lineHeight: "1.32"
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {hovered.name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#b1b1ae",
                marginTop: 2,
                fontWeight: 400,
              }}
            >
              {getFirstYear(hovered)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
