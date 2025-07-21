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
    let height = marker.modalHeight || 720;

if (marker.name.toLowerCase().includes("mesopotamia")) {
  src = "/models/world/mesopotamia/index.html";
  width = 2436; height = 720;
} else if (marker.name.toLowerCase().includes("eastern state")) {
  src = "/models/world/eastern_state/index.html";
  width = 2436; height = 720;
} else if (marker.name.toLowerCase().includes("maison de force")) {
  src = "/models/world/maison_de_force/index.html";
  width = 2436; height = 720;
} else if (marker.name.toLowerCase().includes("militarized prison architecture")) {
  src = "/models/world/militarized_prison_architecture/index.html";
  width = 2436; height = 720;
} else if (marker.name.toLowerCase().includes("nazi camp system")) {
  src = "/models/world/nazi_camp_system/index.html";
  width = 2436; height = 720;
} else if (marker.name.toLowerCase().includes("newgate prison")) {
  src = "/models/world/newgate_prison/index.html";
  width = 2436; height = 720;
} else if (marker.name.toLowerCase().includes("panopticon")) {
  src = "/models/world/panopticon/index.html";
  width = 2436; height = 720;
} else if (marker.name.toLowerCase().includes("scandinavian prison reform")) {
  src = "/models/world/scandinavian_prison_reform/index.html";
  width = 2436; height = 720;
} else if (marker.name.toLowerCase().includes("the mamertine prison")) {
  src = "/models/world/the_mamertine_prison/index.html";
  width = 2436; height = 720;
} else if (marker.name.toLowerCase().includes("the tower of london")) {
  src = "/models/world/the_tower_of_london/index.html";
  width = 2436; height = 720;
} else if (marker.name.toLowerCase().includes("british penal colonies")) {
  src = "/models/world/british_penal_colonies/index.html";
  width = 2436; height = 720;
}
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
