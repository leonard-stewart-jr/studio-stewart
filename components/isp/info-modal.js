import dynamic from "next/dynamic";

// Dynamically import the FloatingModal with SSR disabled
const FloatingModal = dynamic(
  () => import("./modal/floatingmodal"),
  { ssr: false }
);

export default function InfoModal({ open, onClose, marker }) {
  // Example: Use modal for any marker
  if (open && marker && marker.name) {
    // Map marker name to HTML file and width
    let slug = marker.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    let src = `/models/world/${slug}/index.html`; // Your convention
    let width = marker.modalWidth || 1100; // You can set this per marker

    // For now, hardcoded for Mesopotamia
    if (marker.name.toLowerCase().startsWith("mesopotamia")) {
      src = "/models/world/mesopotamia/index.html";
      width = 1100;
    }

    return (
      <FloatingModal open={open} onClose={onClose} src={src} width={width} />
    );
  }

  // Fallback: No modal for other markers (add more logic here if needed)
  return null;
}
