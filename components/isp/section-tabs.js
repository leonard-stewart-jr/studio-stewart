import React from "react";

export default function SectionTabs({ activeSection, setActiveSection }) {
  return (
    <div style={{ marginTop: 36, marginBottom: 0 }}>
      <div className="isp-title">INDEPENDENT STUDIO</div>
      <div className="isp-section-tabs">
        <button
          className={
            "isp-tab-btn" + (activeSection === "history" ? " active" : "")
          }
          onClick={() => setActiveSection("history")}
          aria-current={activeSection === "history" ? "page" : undefined}
        >
          HISTORY
        </button>
        <button
          className={
            "isp-tab-btn future" + (activeSection === "future" ? " active" : "")
          }
          onClick={() => setActiveSection("future")}
          aria-current={activeSection === "future" ? "page" : undefined}
        >
          FUTURE
        </button>
      </div>
    </div>
  );
}
