import React, { useState } from "react";
import ProjectList from "../components/ProjectList";
import ProjectModal from "../components/ProjectModal";
import projects from "../data/projects";

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
        <ProjectModal
          project={projects[activeIndex]}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </main>
  );
}
