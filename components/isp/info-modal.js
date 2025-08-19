import dynamic from "next/dynamic";
import ShareButton from "./sharebutton";

// Dynamically import the FloatingModal with SSR disabled
const FloatingModal = dynamic(
  () => import("./modal/floatingmodal"),
  { ssr: false }
);

export default function InfoModal({ open, onClose, marker }) {
  if (open && marker && marker.name) {
    // Create slug for HTML path
    let slug = marker.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    let src = `/models/world/${slug}/index.html`;

    // Use marker.modalWidth and marker.modalHeight if present, otherwise fallback to defaults
    let width = marker.modalWidth || 2436;
    let height = marker.modalHeight || 720;

    // World modals: exact names from your screenshot/folder list
    if (marker.name.toLowerCase().includes("british penal colonies")) {
      src = "/models/world/british_penal_colonies/index.html";
    } else if (marker.name.toLowerCase().includes("eastern state")) {
      src = "/models/world/eastern_state/index.html";
    } else if (marker.name.toLowerCase().includes("maison de force")) {
      src = "/models/world/maison_de_force/index.html";
    } else if (marker.name.toLowerCase().includes("mesopotamia")) {
      src = "/models/world/mesopotamia-1/index.html";
    } else if (marker.name.toLowerCase().includes("militarized architecture: control, order, and state power")) {
      src = "/models/world/militarized_prison_architecture/index.html";
    } else if (marker.name.toLowerCase().includes("nazi camps: slavery, terror, and genocide")) {
      src = "/models/world/nazi_camp_system/index.html";
    } else if (marker.name.toLowerCase().includes("newgate prison")) {
      src = "/models/world/newgate_prison/index.html";
    } else if (marker.name.toLowerCase().includes("panopticon")) {
      src = "/models/world/panopticon/index.html";
    } else if (marker.name.toLowerCase().includes("scandinavian prison: dignity, rehabilitation, and social justice")) {
      src = "/models/world/scandinavian_prison_reform/index.html";
    } else if (marker.name.toLowerCase().includes("the mamertine prison")) {
      src = "/models/world/the_mamertine_prison/index.html";
    } else if (marker.name.toLowerCase().includes("the tower of london")) {
      src = "/models/world/the_tower_of_london/index.html";
    }

    // Generate PDF URL by replacing index.html with file.pdf (customize if your PDFs have a different path)
    const pdfUrl = src.replace(/index\.html$/, "file.pdf");
    // HTML link is the modal src as shown in the address bar
    const htmlUrl = typeof window !== "undefined"
      ? window.location.origin + src
      : src;
    const shareTitle = marker.name;

    // Debug: log the resolved src and marker
    console.log({ src, marker });

    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <FloatingModal
          open={open}
          onClose={onClose}
          src={src}
          width={width}
          height={height}
        />
        {/* Share button is absolutely positioned in the modal's bottom left corner, right-aligned with modal's title */}
        <div style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          zIndex: 33,
          pointerEvents: "none" // allows modal close click-through except for sharebutton group
        }}>
          <div style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            pointerEvents: "auto"
          }}>
            <ShareButton
              pdfUrl={pdfUrl}
              htmlUrl={htmlUrl}
              shareTitle={shareTitle}
              style={{
                margin: "0 62px 26px 0", // adjust as needed to align with your modal's title/text
                maxWidth: 420
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback: No modal for other markers
  return null;
}
