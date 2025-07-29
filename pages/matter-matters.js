import React from "react";

export default function MatterMatters() {
  return (
    <main style={{ width: "100%", minHeight: "100vh", background: "#fff" }}>
      <iframe
        src="/static/matter-matters/index.html"
        style={{
          width: "100%",
          minHeight: "2200px", // Adjust this if your export is taller/shorter
          border: "none",
          display: "block",
          background: "#fff"
        }}
        title="Matter Matters — Studio Stewart"
      />
      {/* Placeholder for Human Capital Index React component */}
      <div id="hc-periodic-table-root" style={{ margin: "64px 0 0 0", width: "100%" }}>
        {/* Your <HcPeriodicTable /> React component will go here later */}
      </div>
    </main>
  );
}
