import { useState } from "react";
import GlobeSection from "../components/isp/globe-section";
import USAMapSection from "../components/isp/usamap-section";
import SDMapSection from "../components/isp/sdmap-section";
import InfoModal from "../components/isp/info-modal";

export default function IndependentStudio() {
  const [mode, setMode] = useState("world"); // 'world' | 'usa' | 'sd'
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMarker, setActiveMarker] = useState(null);

  function openMarker(marker) {
    setActiveMarker(marker);
    setModalOpen(true);
  }

  return (
    <div className="matter-matters-page" style={{ background: "#fff" }}>
      {/* Primary section tabs */}
      <div className="nav-card nav-card-mid">
        <div className="isp-section-tabs">
          <button
            className={`isp-tab-btn ${mode === "world" ? "active" : ""}`}
            onClick={() => setMode("world")}
            aria-current={mode === "world" ? "page" : undefined}
            title="World"
          >
            World
          </button>
          <button
            className={`isp-tab-btn ${mode === "usa" ? "active" : ""}`}
            onClick={() => setMode("usa")}
            aria-current={mode === "usa" ? "page" : undefined}
            title="USA"
          >
            USA
          </button>
          <button
            className={`isp-tab-btn ${mode === "sd" ? "active" : ""}`}
            onClick={() => setMode("sd")}
            aria-current={mode === "sd" ? "page" : undefined}
            title="South Dakota"
          >
            South Dakota
          </button>
        </div>
      </div>

      {/* Subnav row (optional placeholder, kept for styling hooks) */}
      <div className="nav-card nav-card-bot">
        <div className="isp-subnav-row">
          <span className="isp-subnav-btn active" aria-current="page">Overview</span>
          <span className="isp-subnav-btn">Timeline</span>
          <span className="isp-subnav-btn">References</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ width: "min(1200px, 96vw)", margin: "0 auto", padding: "18px 0 42px 0" }}>
        {mode === "world" && (
          <GlobeSection onMarkerClick={openMarker} mode="world" />
        )}
        {mode === "usa" && (
          <USAMapSection onMarkerClick={openMarker} />
        )}
        {mode === "sd" && (
          <SDMapSection onMarkerClick={openMarker} />
        )}
      </div>

      {/* Modal */}
      <InfoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        marker={activeMarker}
      />
    </div>
  );
}