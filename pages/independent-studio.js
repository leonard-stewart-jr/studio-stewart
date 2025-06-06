import { useState } from "react";
import dynamic from "next/dynamic";
import SideBanner from "../components/isp/sidebanner";
import GlobeSection from "../components/isp/globe-section";
import USAMapSection from "../components/isp/usamap-section";
import SDMapSection from "../components/isp/sdmap-section";
import InfoModal from "../components/isp/info-modal";

export default function IndependentStudio() {
  const [modalData, setModalData] = useState(null);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafafa" }}>
      {/* Left Banner */}
      <SideBanner text="ORIGINS OF CONFINEMENT" color="#b32c2c" side="left" />

      {/* Main Content */}
      <div style={{
        flex: 1, overflowY: "auto", maxWidth: "100vw", position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center"
      }}>
        <GlobeSection onMarkerClick={loc => setModalData({ title: loc.name, content: loc.content })} />
        <USAMapSection onMarkerClick={loc => setModalData({ title: loc.name, content: loc.content })} />
        <SDMapSection onMarkerClick={ev => setModalData({ title: `${ev.year}, ${ev.name}`, content: ev.content })} />
      </div>

      {/* Right Banner */}
      <SideBanner text="BREAKING THE CYCLE" color="#35396e" side="right" />

      {/* Info Modal */}
      <InfoModal
        open={!!modalData}
        onClose={() => setModalData(null)}
        title={modalData?.title}
        content={modalData?.content}
      />
    </div>
  );
}
