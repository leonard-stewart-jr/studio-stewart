import dynamic from "next/dynamic";

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
    let width = marker.modalWidth || 2995;
    let height = marker.modalHeight || 880;

    // For now, hardcoded for Mesopotamia (update this logic as you add more modals)
    if (marker.name.toLowerCase().startsWith("mesopotamia")) {
      src = "/models/world/mesopotamia2/index.html";
      width = 2436;
      height = 720;
    }

    return (
      <FloatingModal
        open={open}
        onClose={onClose}
        src={src}
        width={width}
        height={height}
      />
    );
  }

  // Fallback: No modal for other markers
  return null;
}
