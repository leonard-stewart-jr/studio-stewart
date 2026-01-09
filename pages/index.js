import React, { useState } from "react";
import ProjectList from "../components/ProjectList";
import FloatingProjectModal from "../components/floatingprojectmodal";
import projects from "../data/projects";

// Helper: Derive the HTML5 export path and width from project (add these in your data if not present)
function getProjectModalProps(project) {
  // Use your desired file structure:
  // For DMA-25: /portfolio/dma/25/index
  // For other projects, adjust as needed!
  let src = "";
  if (project.slug === "DMA-25") {
    src = "/portfolio/dma/25/index";
  } else if (project.slug === "MPSC-24") {
    src = "/portfolio/mpsc/24/index";
  } else if (project.slug === "BPL-24") {
    src = "/portfolio/bpl/24/index";
  } else {
    // fallback: use slug-lower
    src = `/portfolio/${project.slug.toLowerCase()}/index`;
  }
  const width = project.modalWidth || 2436;
  return { src, width };
}

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <main style={{
      minHeight: "100vh",
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <ProjectList projects={projects} onProjectClick={setActiveIndex} />
      {activeIndex !== null && (
        <FloatingProjectModal
          open={true}
          onClose={() => setActiveIndex(null)}
          // Get src/width for the selected project:
          {...getProjectModalProps(projects[activeIndex])}
          height={785}
          navOffset={76}
        />
      )}
    </main>
  );
}