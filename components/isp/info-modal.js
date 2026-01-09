import dynamic from "next/dynamic";

// Use the existing FloatingProjectModal (client-only)
const FloatingProjectModal = dynamic(() => import("../floatingprojectmodal"), {
  ssr: false
});

export default function InfoModal({ open, onClose, marker }) {
  if (!open || !marker || !marker.name) return null;

  // Create slug/path
  let slug = marker.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  let src = `/models/world/${slug}/index.html`;

  // Known folder-name overrides (world models)
  const lower = marker.name.toLowerCase();
  if (lower.includes("british penal colonies")) src = "/models/world/british_penal_colonies/index.html";
  else if (lower.includes("eastern state")) src = "/models/world/eastern_state/index.html";
  else if (lower.includes("maison de force")) src = "/models/world/maison_de_force/index.html";
  else if (lower.includes("mesopotamia")) src = "/models/world/mesopotamia-1/index.html";
  else if (lower.includes("militarized architecture")) src = "/models/world/militarized_prison_architecture/index.html";
  else if (lower.includes("nazi camps")) src = "/models/world/nazi_camp_system/index.html";
  else if (lower.includes("newgate prison")) src = "/models/world/newgate_prison/index.html";
  else if (lower.includes("panopticon")) src = "/models/world/panopticon/index.html";
  else if (lower.includes("scandinavian prison")) src = "/models/world/scandinavian_prison_reform/index.html";
  else if (lower.includes("the mamertine prison")) src = "/models/world/the_mamertine_prison/index.html";
  else if (lower.includes("the tower of london")) src = "/models/world/the_tower_of_london/index.html";

  // Dimensions
  const width = marker.modalWidth || 2436;
  const height = marker.modalHeight || 785;
  const navOffset = 60;

  // Generate PDF URL from model folder
  let pdfUrl;
  if (src.includes("mesopotamia-1")) {
    pdfUrl = "/models/world/mesopotamia-1/mesopotamia.pdf";
  } else {
    const folderMatch = src.match(/\/models\/world\/([^\/]+)\/index\.html/);
    if (folderMatch) {
      const folder = folderMatch[1];
      pdfUrl = `/models/world/${folder}/${folder}.pdf`;
    }
  }

  // HTML url for sharing
  const htmlUrl = typeof window !== "undefined" ? window.location.origin + src : src;

  return (
    <>
      <FloatingProjectModal
        onClose={onClose}
        src={src}
        width={width}
        height={height}
        navOffset={navOffset}
      />

      {/* Simple share bar overlay (bottom-left) */}
      <div
        style={{
          position: "fixed",
          left: 16,
          bottom: 16,
          zIndex: 2000,
          display: "flex",
          gap: 12,
          background: "rgba(255,255,255,0.95)",
          border: "1px solid #e9e7e0",
          boxShadow: "0 3px 14px rgba(0,0,0,0.10)",
          padding: "8px 12px",
          borderRadius: 6
        }}
      >
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none", color: "#181818", fontFamily: "coolvetica, sans-serif", fontSize: 12 }}
          >
            Download PDF
          </a>
        )}
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "none", color: "#181818", fontFamily: "coolvetica, sans-serif", fontSize: 12 }}
        >
          Open HTML
        </a>
        <button
          onClick={() => {
            if (navigator.clipboard && htmlUrl) navigator.clipboard.writeText(htmlUrl);
          }}
          style={{
            background: "#e6dbb9",
            color: "#181818",
            border: "1px solid #d6c08e",
            borderRadius: 4,
            padding: "4px 8px",
            cursor: "pointer",
            fontFamily: "coolvetica, sans-serif",
            fontSize: 12
          }}
        >
          Copy Link
        </button>
      </div>
    </>
  );
}