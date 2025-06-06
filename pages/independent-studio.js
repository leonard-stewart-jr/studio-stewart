import { useState } from "react";
import dynamic from "next/dynamic";
import SlidingBanner from "../components/isp/sliding-banner";
import InfoModal from "../components/isp/info-modal";

// DYNAMICALLY import these so they only render on the client!
const GlobeSection = dynamic(() => import("../components/isp/globe-section"), { ssr: false }); 
const USAMapSection = dynamic(() => import("../components/isp/usamap-section"), { ssr: false });
const SDMapSection = dynamic(() => import("../components/isp/sdmap-section"), { ssr: false });

export default function IndependentStudio() {
  const [modalData, setModalData] = useState(null);
  const [activeSection, setActiveSection] = useState("world"); // "world", "usa", "sd"

  // Add marginTop: 38 to push content below subnav (subnav is 38px tall)
  return (
    <SlidingBanner>
      <div style={{
        width: "100%",
        minHeight: "100vh",
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: 0, // <-- Only this page needs this!
      }}>
        {/* Only show the selected section */}
        {activeSection === "world" && (
          <GlobeSection onMarkerClick={loc => setModalData({ title: loc.name, content: loc.content })} />
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
          title={modalData?.title}
          content={modalData?.content}
        />
      </div>
    </SlidingBanner>
  );
}
