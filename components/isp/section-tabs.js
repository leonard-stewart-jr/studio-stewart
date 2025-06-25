import React from "react";

export default function SectionTabs({ activeSection, setActiveSection }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 28,
        margin: "42px 0 22px 0",
        width: "100%",
      }}
    >
      <button
        onClick={() => setActiveSection("history")}
        style={{
          background: "none",
          border: "none",
          fontWeight: 700,
          fontSize: 20,
          color: activeSection === "history" ? "#b32c2c" : "#b1b1ae",
          borderBottom: activeSection === "history" ? "3px solid #b32c2c" : "3px solid transparent",
          padding: "7px 22px 11px 22px",
          cursor: activeSection === "history" ? "default" : "pointer",
          transition: "color 0.15s, border 0.15s",
        }}
        aria-current={activeSection === "history" ? "page" : undefined}
      >
        HISTORY
      </button>
      <button
        onClick={() => setActiveSection("future")}
        style={{
          background: "none",
          border: "none",
          fontWeight: 700,
          fontSize: 20,
          color: activeSection === "future" ? "#192d4b" : "#b1b1ae",
          borderBottom: activeSection === "future" ? "3px solid #192d4b" : "3px solid transparent",
          padding: "7px 22px 11px 22px",
          cursor: activeSection === "future" ? "default" : "pointer",
          transition: "color 0.15s, border 0.15s",
        }}
        aria-current={activeSection === "future" ? "page" : undefined}
      >
        FUTURE
      </button>
    </div>
  );
}
