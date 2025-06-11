import { useState } from "react";
import dynamic from "next/dynamic";
import SlidingBanner from "../components/isp/sliding-banner";
import InfoModal from "../components/isp/info-modal";
import ISPSubNav from "../components/isp/isp-subnav";

// DYNAMICALLY import these so they only render on the client!
const GlobeSection = dynamic(() => import("../components/isp/globe-section"), { ssr: false }); 
const USAMapSection = dynamic(() => import("../components/isp/usamap-section"), { ssr: false });
const SDMapSection = dynamic(() => import("../components/isp/sdmap-section"), { ssr: false });

export default function IndependentStudio() {
  const [modalData, setModalData] = useState(null);
  const [activeSection, setActiveSection] = useState("world"); // "world", "usa", "sd"

  return (
    <>
      <ISPSubNav active={activeSection} onChange={setActiveSection} />
      <SlidingBanner>
        <div style={{
          width: "100%",
          minHeight: "100vh",
          background: "#fafafa",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 0, // No extra margin needed
        }}>
          {/* Only show the selected section */}
          {activeSection === "world" && (
            <GlobeSection onMarkerClick={setModalData} />
          )}
          {activeSection === "usa" && (
            <USAMapSection onMarkerClick={loc => setModalData({ title: loc.name, content: loc.content })} />
          )}
          {activeSection === "sd" && (
            <SDMapSection onMarkerClick={ev => setModalData({ title: `${ev.year}, ${ev.name}`, content: ev.content })} />
          )}
          {/* Info Modal */}
          <InfoModal
            open={!!modalData}
            onClose={() => setModalData(null)}
            marker={modalData}
          />
        </div>
      </SlidingBanner>
    </>
  );
}
