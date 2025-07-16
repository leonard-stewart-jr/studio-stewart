import dynamic from "next/dynamic";

// Dynamically import the Mesopotamia modal with SSR disabled
const MesopotamiaModal = dynamic(
  () => import("./modal/mesopotamia-modal"),
  { ssr: false }
);

export default function InfoModal({ open, onClose, marker }) {
  // Show Mesopotamia modal if marker is MESOPOTAMIA
  if (
    open &&
    marker &&
    marker.name &&
    marker.name.toLowerCase().startsWith("mesopotamia")
  ) {
    return (
      <MesopotamiaModal open={open} onClose={onClose} />
    );
  }

  // Fallback: No modal for other markers (add more logic here if needed)
  return null;
}
