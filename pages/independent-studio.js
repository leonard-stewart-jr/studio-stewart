import { useState } from "react";
import dynamic from "next/dynamic";
import SectionTabs from "../components/isp/section-tabs";
import ISPSubNav from "../components/isp/isp-subnav";
import InfoModal from "../components/isp/info-modal";

// DYNAMICALLY import these so they only render on the client!
const GlobeSection = dynamic(() => import("../components/isp/globe-section"), { ssr: false }); 
const USAMapSection = dynamic(() => import("../components/isp/usamap-section"), { ssr: false });
const SDMapSection = dynamic(() => import("../components/isp/sdmap-section"), { ssr: false });

export default function IndependentStudio() {
  // Tabs: "history" or "future"
  const [mainSection, setMainSection] = useState("history");
  // Subnav: "world", "usa", "sd" (only for history)
  const [activeHistory, setActiveHistory] = useState("world");
  // Info modal state
  const [modalData, setModalData] = useState(null);

  return (
    <>
      {/* --- WHITE NAV WRAPPER --- */}
      <div style={{
        width: "100%",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: 0,
        padding: 0,
      }}>
        {/* HISTORY / FUTURE Tabs */}
        <SectionTabs
          activeSection={mainSection}
          setActiveSection={setMainSection}
        />
        {/* Divider below section tabs */}
        <div className="nav-divider"></div>
        {/* Show subnav only if HISTORY tab is active */}
        {mainSection === "history" && (
          <>
            <ISPSubNav active={activeHistory} onChange={setActiveHistory} />
            {/* Divider below WORLD/USA/SD subnav */}
            <div className="nav-divider"></div>
          </>
        )}
      </div>
      {/* --- END WHITE NAV WRAPPER --- */}

      {/* --- CONTENT: Globe/Map, sits on background color --- */}
      {mainSection === "history" && (
        <>
          {activeHistory === "world" && (
            <GlobeSection onMarkerClick={setModalData} />
          )}
          {activeHistory === "usa" && (
            <USAMapSection onMarkerClick={setModalData} />
          )}
          {activeHistory === "sd" && (
            <SDMapSection onMarkerClick={setModalData} />
          )}
        </>
      )}
      {mainSection === "future" && (
        <div style={{
          minHeight: 500,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          color: "#192d4b",
          fontWeight: 700,
          letterSpacing: ".02em",
          opacity: 0.7,
        }}>
          FUTURE CONTENT COMING SOON
        </div>
      )}

      {/* Info Modal */}
      <InfoModal
        open={!!modalData}
        onClose={() => setModalData(null)}
        marker={modalData}
      />
    </>
  );
}
