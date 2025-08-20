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

    return (
      <FloatingModal
        open={open}
        onClose={onClose}
        src={src}
        width={width}
        height={height}
      >
        {/* Share bar INSIDE the modal content, bottom-left aligned and shifted left by 260px */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "flex-end",
            margin: 0,
            padding: 0,
            position: "absolute",
            left: 0,
            bottom: 0,
            zIndex: 120,
            pointerEvents: "auto",
            transform: "translateX(-260px)", // <--- This is the main change
          }}
        >
          <ShareButton
            pdfUrl={pdfUrl}
            htmlUrl={htmlUrl}
            shareTitle={shareTitle}
            style={{
              margin: "0 0 24px 32px", // bottom left
              maxWidth: 420,
            }}
          />
        </div>
      </FloatingModal>
    );
  }

  // Fallback: No modal for other markers
  return null;
}
