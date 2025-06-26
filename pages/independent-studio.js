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
      {/* NAVIGATION LAYERS IN "CARD" STYLE" */}
      {/* Main nav: handled by layout/header, so only render cards from tabs down */}
      <div
        className="nav-card nav-card-mid"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box"
        }}
      >
        <div style={{ flex: "0 0 auto", width: 88, minWidth: 88 }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <SectionTabs
            activeSection={mainSection}
            setActiveSection={setMainSection}
          />
        </div>
        <div style={{ flex: "0 0 auto", width: 66, minWidth: 66 }} />
      </div>
      {mainSection === "history" && (
        <div
          className="nav-card nav-card-bot"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            boxSizing: "border-box"
          }}
        >
          <div style={{ flex: "0 0 auto", width: 88, minWidth: 88 }} />
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <ISPSubNav active={activeHistory} onChange={setActiveHistory} />
          </div>
          <div style={{ flex: "0 0 auto", width: 66, minWidth: 66 }} />
        </div>
      )}

      {/* --- CONTENT: Globe/Map, sits on background color, NO divider above --- */}
      {mainSection === "history" && (
        <section className="isp-globe-section">
          {activeHistory === "world" && (
            <GlobeSection onMarkerClick={setModalData} />
          )}
          {activeHistory === "usa" && (
            <USAMapSection onMarkerClick={setModalData} />
          )}
          {activeHistory === "sd" && (
            <SDMapSection onMarkerClick={setModalData} />
          )}
        </section>
      )}
      {mainSection === "future" && (
        <div
          style={{
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
          }}
        >
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
