import React from "react";

export default function SectionTabs({ activeSection, setActiveSection }) {
  return (
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
          "isp-tab-btn" + (activeSection === "future" ? " active" : "")
        }
        onClick={() => setActiveSection("future")}
        aria-current={activeSection === "future" ? "page" : undefined}
      >
        FUTURE
      </button>
    </div>
  );
}
