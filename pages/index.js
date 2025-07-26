import React, { useState } from "react";
import ProjectList from "../components/ProjectList";
import FloatingProjectModal from "../components/floatingprojectmodal";
import projects from "../data/projects";

// Helper: Derive the HTML5 export path and width from project (add these in your data if not present)
function getProjectModalProps(project) {
  // EXAMPLES -- customize for your actual file structure!
  const slug = project.slug?.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const src = `/models/projects/${slug}/index.html`; // Adjust path as needed!
  const width = project.modalWidth || 2436; // Add modalWidth to your project data for each project!
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
